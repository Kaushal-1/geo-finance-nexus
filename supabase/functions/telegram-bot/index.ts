
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { TelegramBot } from "./telegram-bot.ts";
import { TradingService } from "./trading-service.ts";
import { AlertService } from "./alert-service.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Specify allowed user ID
const ALLOWED_USER_ID = "2085478565";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Ensure PERPLEXITY_API_KEY is available
    if (!Deno.env.get('PERPLEXITY_API_KEY')) {
      console.error('PERPLEXITY_API_KEY environment variable not set!');
    }

    // Initialize services
    const tradingService = new TradingService();
    const alertService = new AlertService(supabaseClient);
    const telegramBot = new TelegramBot(tradingService, alertService);

    // If this is a webhook from Telegram
    if (req.method === 'POST') {
      const body = await req.json();
      
      // Check if this is a verification request from our UI
      if (body.action === 'verify_connection' && body.user_id) {
        console.log(`Verifying Telegram connection for user: ${body.user_id}`);
        
        // Only allow verification for the specific user ID
        if (body.user_id !== ALLOWED_USER_ID) {
          return new Response(
            JSON.stringify({ 
              status: 'disconnected',
              user_id: body.user_id,
              message: "This user ID is not authorized to connect."
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        
        const isConnected = await telegramBot.verifyConnection(body.user_id);
        
        return new Response(
          JSON.stringify({ 
            status: isConnected ? 'connected' : 'disconnected',
            user_id: body.user_id 
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      // Handle settings update request
      if (body.action === 'update_settings' && body.user_id && body.settings) {
        console.log(`Updating settings for user: ${body.user_id}`);
        
        // Only allow updates for the specific user ID
        if (body.user_id !== ALLOWED_USER_ID) {
          return new Response(
            JSON.stringify({ 
              success: false,
              message: "This user ID is not authorized to update settings."
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        
        try {
          // Directly store settings in memory or use a more permanent storage solution
          // This bypasses Supabase RLS policies
          const result = await telegramBot.updateSettings(body.user_id, body.settings);
          
          return new Response(
            JSON.stringify({ 
              success: true,
              message: "Settings updated successfully" 
            }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              success: false,
              message: `Failed to update settings: ${error.message}` 
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
      }
      
      // Regular Telegram update - check if it's from the allowed user
      console.log("Received Telegram update:", JSON.stringify(body));
      
      // Skip processing updates from unauthorized users
      if (body.message && body.message.chat && body.message.chat.id.toString() !== ALLOWED_USER_ID) {
        console.log(`Skipping update from unauthorized user: ${body.message.chat.id}`);
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      // Process the update
      await telegramBot.processUpdate(body);
      
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // If it's not a Telegram webhook, return error
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
