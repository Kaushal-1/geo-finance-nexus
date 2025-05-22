import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY') || 'PKJ1BKJG3HHOXYNCRLZK';
const ALPACA_API_SECRET = Deno.env.get('ALPACA_API_SECRET') || 'l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd';
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

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
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Fetch all active price alerts
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('price_alerts')
      .select('*')
      .eq('active', true);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch alerts' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${alerts.length} active alerts`);

    // Function to fetch current price for a symbol
    async function getCurrentPrice(symbol: string): Promise<number | null> {
      try {
        const url = `https://data.alpaca.markets/v2/stocks/${symbol}/last`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': ALPACA_API_KEY,
            'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
          },
        });

        if (!response.ok) {
          console.error(`Error fetching price for ${symbol}: ${response.status} ${response.statusText}`);
          return null;
        }

        const data = await response.json();
        return data?.last?.price || null;
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return null;
      }
    }

    // Function to send a Telegram message
    async function sendTelegramMessage(chatId: string, message: string): Promise<void> {
      const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          console.error('Failed to send Telegram message:', errorBody);
          throw new Error(`Telegram API error: ${response.status} - ${JSON.stringify(errorBody)}`);
        }

        const result = await response.json();
        console.log('Telegram message sent successfully:', result);
      } catch (error) {
        console.error('Error sending Telegram message:', error);
        throw error; // Re-throw to be caught by the outer try-catch
      }
    }

    // Add a check for Telegram settings when handling alerts
    const checkTelegramSettings = async (telegramChatId: string) => {
      const { data } = await supabaseClient
        .from('telegram_settings')
        .select('price_alerts')
        .eq('user_id', telegramChatId)
        .single();
      
      // If no settings or price_alerts is enabled, return true
      return !data || data.price_alerts;
    };

    // Process each alert
    for (const alert of alerts) {
      const currentPrice = await getCurrentPrice(alert.symbol);

      if (currentPrice === null) {
        console.warn(`Could not fetch current price for ${alert.symbol}, skipping alert ${alert.id}`);
        continue;
      }

      let shouldTrigger = false;
      let direction = '';

      if (alert.condition === 'price_above' && currentPrice > alert.threshold) {
        shouldTrigger = true;
        direction = 'above';
      } else if (alert.condition === 'price_below' && currentPrice < alert.threshold) {
        shouldTrigger = true;
        direction = 'below';
      }

      if (shouldTrigger) {
        console.log(`Alert ${alert.id} triggered for ${alert.symbol}: current price ${currentPrice}, threshold ${alert.threshold}`);

        // Check if user has price alerts enabled
        if (await checkTelegramSettings(alert.telegram_chat_id)) {
          // Construct the message
          const emoji = direction === 'above' ? '📈' : '📉';
          const message = `
${emoji} <b>Stock Price Alert</b>

💹 <b>Symbol:</b> ${alert.symbol}
📊 <b>Current Price:</b> $${Number(currentPrice).toFixed(2)}
🎯 <b>Target Threshold:</b> $${Number(alert.threshold).toFixed(2)}
🕰️ <b>Status:</b> Price is ${direction} the threshold.

🔍 <a href="https://www.tradingview.com/symbols/${alert.symbol}/">View on TradingView</a>
`;

          try {
            // Send Telegram message
            await sendTelegramMessage(alert.telegram_chat_id, message);

            // Mark the alert as triggered (optional, depending on your logic)
            const { error: triggerError } = await supabaseClient
              .from('price_alerts')
              .update({ active: false, triggered_at: new Date().toISOString() })
              .eq('id', alert.id);

            if (triggerError) {
              console.error(`Error marking alert ${alert.id} as triggered:`, triggerError);
            } else {
              console.log(`Alert ${alert.id} marked as triggered`);
            }
          } catch (telegramError) {
            console.error(`Failed to send Telegram message for alert ${alert.id}:`, telegramError);
          }
        } else {
          console.log(`Telegram notifications are disabled for user ${alert.telegram_chat_id}. Alert ${alert.id} not sent.`);
        }
      }
    }

    return new Response(JSON.stringify({ status: 'ok', processed: alerts.length }), {
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
