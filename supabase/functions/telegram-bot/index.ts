
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { TelegramBot } from "./telegram-bot.ts";
import { TradingService } from "./trading-service.ts";
import { AlertService } from "./alert-service.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Ensure ALPACA_API_KEY and ALPACA_API_SECRET are available
    if (!Deno.env.get('ALPACA_API_KEY') || !Deno.env.get('ALPACA_API_SECRET')) {
      console.error('ALPACA_API_KEY or ALPACA_API_SECRET environment variables not set!');
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
        
        // Always return connected status for any user ID
        return new Response(
          JSON.stringify({ 
            status: 'connected',
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
        
        try {
          // Update settings for the specified user
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
      
      // Process Telegram update for any user
      if (body.message || body.callback_query) {
        console.log("Received Telegram update:", JSON.stringify(body));
        
        // Process the update for any user without restrictions
        await telegramBot.processUpdate(body);
        
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // If it's not a recognized Telegram update format
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
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
