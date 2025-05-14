
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

    // Initialize services
    const tradingService = new TradingService();
    const alertService = new AlertService(supabaseClient);
    const telegramBot = new TelegramBot(tradingService, alertService);

    // If this is a webhook from Telegram
    if (req.method === 'POST') {
      const update = await req.json();
      console.log("Received Telegram update:", JSON.stringify(update));
      
      // Process the update
      await telegramBot.processUpdate(update);
      
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
