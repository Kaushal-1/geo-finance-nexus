
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Alert checker function invoked");

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active alerts
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('price_alerts')
      .select('*')
      .eq('active', true);

    if (alertsError) {
      throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    }

    if (!alerts || alerts.length === 0) {
      console.log("No active alerts to check");
      return new Response(JSON.stringify({ status: 'ok', message: 'No alerts to check' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${alerts.length} active alerts to check`);
    
    // Group alerts by symbol to minimize API calls
    const symbolGroups = {};
    alerts.forEach(alert => {
      if (!symbolGroups[alert.symbol]) {
        symbolGroups[alert.symbol] = [];
      }
      symbolGroups[alert.symbol].push(alert);
    });

    // Process each symbol
    const processedAlerts = [];
    for (const symbol of Object.keys(symbolGroups)) {
      try {
        // Get current price from Alpaca API
        const price = await getCurrentPrice(symbol);
        if (!price) {
          console.log(`Couldn't get price for ${symbol}, skipping alerts`);
          continue;
        }

        // Process all alerts for this symbol
        for (const alert of symbolGroups[symbol]) {
          const isTriggered = checkAlert(alert, price);
          if (isTriggered) {
            await triggerAlert(supabaseClient, alert, price);
            processedAlerts.push({
              symbol: alert.symbol,
              telegramChatId: alert.telegram_chat_id,
              condition: alert.condition,
              threshold: alert.threshold,
              currentPrice: price
            });
          }
        }
      } catch (e) {
        console.error(`Error processing ${symbol} alerts:`, e);
      }
    }

    return new Response(JSON.stringify({ 
      status: 'ok',
      alerts_checked: alerts.length,
      alerts_triggered: processedAlerts.length
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error("Error checking alerts:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

async function getCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const API_KEY = Deno.env.get('ALPACA_API_KEY') || 'PKJ1BKJG3HHOXYNCRLZK';
    const API_SECRET = Deno.env.get('ALPACA_API_SECRET') || 'l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd';
    
    // Use the Alpaca API to get the latest quote
    const response = await fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`, {
      headers: {
        'APCA-API-KEY-ID': API_KEY,
        'APCA-API-SECRET-KEY': API_SECRET
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch price for ${symbol}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data && data.quote) {
      // Use the midpoint of bid and ask as the current price
      const midPrice = (data.quote.ap + data.quote.bp) / 2;
      console.log(`Current price for ${symbol}: ${midPrice}`);
      return midPrice;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting price for ${symbol}:`, error);
    return null;
  }
}

function checkAlert(alert: any, currentPrice: number): boolean {
  if (alert.condition === 'price_above' && currentPrice >= alert.threshold) {
    console.log(`Alert triggered: ${alert.symbol} price ${currentPrice} is above threshold ${alert.threshold}`);
    return true;
  }
  
  if (alert.condition === 'price_below' && currentPrice <= alert.threshold) {
    console.log(`Alert triggered: ${alert.symbol} price ${currentPrice} is below threshold ${alert.threshold}`);
    return true;
  }
  
  return false;
}

async function triggerAlert(supabase: any, alert: any, currentPrice: number): Promise<void> {
  try {
    // 1. Mark the alert as triggered in the database
    const { error } = await supabase
      .from('price_alerts')
      .update({ 
        triggered_at: new Date().toISOString(),
        active: false
      })
      .eq('id', alert.id);
    
    if (error) {
      throw new Error(`Failed to update alert status: ${error.message}`);
    }
    
    // 2. Send notification to Telegram
    await sendTelegramAlert(
      alert.telegram_chat_id,
      alert.symbol,
      currentPrice,
      alert.threshold,
      alert.condition === 'price_above' ? 'above' : 'below'
    );
    
  } catch (error) {
    console.error(`Failed to process triggered alert ${alert.id}:`, error);
  }
}

async function sendTelegramAlert(
  chatId: string, 
  symbol: string, 
  currentPrice: number, 
  thresholdPrice: number, 
  direction: string
): Promise<void> {
  try {
    const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    if (!BOT_TOKEN) {
      throw new Error('Telegram bot token is missing');
    }

    const emoji = direction === 'above' ? '📈' : '📉';
    const message = `
${emoji} <b>Stock Price Alert</b>

💹 <b>Symbol:</b> ${symbol}
📊 <b>Current Price:</b> $${Number(currentPrice).toFixed(2)}
🎯 <b>Target Threshold:</b> $${Number(thresholdPrice).toFixed(2)}
🕰️ <b>Status:</b> Price is ${direction} the threshold.

🔍 <a href="https://www.tradingview.com/symbols/${symbol}/">View on TradingView</a>
`;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || `Failed with status ${response.status}`);
    }
    
    console.log(`Alert notification sent to Telegram chat ${chatId} for ${symbol}`);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}
