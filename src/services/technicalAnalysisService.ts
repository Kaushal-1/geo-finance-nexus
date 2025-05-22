import { alpacaService } from './alpacaService';

// Calculate Moving Average
export const calculateMA = (prices: number[], period: number): number => {
  if (prices.length < period) return 0;
  
  const relevantPrices = prices.slice(-period);
  const sum = relevantPrices.reduce((acc, price) => acc + price, 0);
  return parseFloat((sum / period).toFixed(2));
};

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length <= period) return 50; // Default neutral value if not enough data
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses += Math.abs(difference);
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI using smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    
    if (difference >= 0) {
      avgGain = (avgGain * (period - 1) + difference) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(difference)) / period;
    }
  }
  
  if (avgLoss === 0) return 100; // No losses means RSI = 100
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return parseFloat(rsi.toFixed(2));
};

// Calculate MACD
export const calculateMACD = (prices: number[]): { macd: number, signal: number, histogram: number } => {
  if (prices.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  // Calculate 12-day EMA
  const ema12 = calculateEMA(prices, 12);
  
  // Calculate 26-day EMA
  const ema26 = calculateEMA(prices, 26);
  
  // MACD line is the difference between 12-day EMA and 26-day EMA
  const macdLine = parseFloat((ema12 - ema26).toFixed(2));
  
  // Get MACD values for the last 9 periods to calculate the signal line
  const macdValues = [];
  for (let i = prices.length - 9; i < prices.length; i++) {
    const slice = prices.slice(0, i + 1);
    const ema12Temp = calculateEMA(slice, 12);
    const ema26Temp = calculateEMA(slice, 26);
    macdValues.push(ema12Temp - ema26Temp);
  }
  
  // Signal line is 9-day EMA of MACD line
  const signalLine = parseFloat(calculateEMA(macdValues, 9).toFixed(2));
  
  // MACD histogram is the difference between MACD line and signal line
  const histogram = parseFloat((macdLine - signalLine).toFixed(2));
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
};

// Helper function to calculate EMA
const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) return 0;
  
  const k = 2 / (period + 1);
  
  // Start with SMA for the first EMA value
  let ema = prices.slice(0, period).reduce((total, price) => total + price, 0) / period;
  
  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  
  return ema;
};

// Get 52-week high and low
export const get52WeekRange = async (symbol: string): Promise<{ high: number, low: number }> => {
  try {
    // Get one year of daily data
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Use alpacaService to get historical data
    const bars = await alpacaService.getBars(symbol, '1Week', 52);
    
    if (!bars || bars.length === 0) {
      return { high: 0, low: 0 };
    }
    
    // Find highest high and lowest low
    let high = -Infinity;
    let low = Infinity;
    
    for (const bar of bars) {
      high = Math.max(high, bar.h);
      low = Math.min(low, bar.l);
    }
    
    return { 
      high: parseFloat(high.toFixed(2)), 
      low: parseFloat(low.toFixed(2))
    };
  } catch (error) {
    console.error('Error getting 52-week range:', error);
    return { high: 0, low: 0 };
  }
};

// Fetch stock metrics and technical indicators
export const fetchStockMetrics = async (symbol: string): Promise<any> => {
  try {
    // Get historical bars for calculations (60 days of data)
    const bars = await alpacaService.getBars(symbol, '1Day', 60);
    
    if (!bars || bars.length === 0) {
      throw new Error('No historical data available');
    }
    
    // Extract closing prices
    const prices = bars.map(bar => bar.c);
    
    // Get current price (latest bar)
    const currentPrice = prices[prices.length - 1];
    
    // Calculate moving averages
    const ma50 = calculateMA(prices, Math.min(50, prices.length));
    const ma200 = calculateMA(prices, Math.min(200, prices.length));
    
    // Calculate RSI
    const rsi = calculateRSI(prices);
    
    // Calculate MACD
    const macd = calculateMACD(prices);
    
    // Get 52-week high/low
    const weekRange = await get52WeekRange(symbol);
    
    // Extract volume data
    const volumes = bars.map(bar => bar.v);
    const currentVolume = volumes[volumes.length - 1];
    const avgVolume = calculateMA(volumes, Math.min(30, volumes.length));
    
    // Return compiled metrics
    return {
      symbol,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      weekHigh: weekRange.high,
      weekLow: weekRange.low,
      ma50,
      ma200,
      rsi,
      macd: macd.macd,
      macdSignal: macd.signal,
      macdHistogram: macd.histogram,
      volume: currentVolume,
      avgVolume: parseFloat(avgVolume.toFixed(0)),
      volumeTrend: currentVolume > avgVolume ? 'Above Average' : 'Below Average',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error);
    throw error;
  }
};

// Function to fetch fundamental data using Perplexity (Sonar) API
export const fetchFundamentalData = async (symbol: string): Promise<any> => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst AI that provides accurate and up-to-date fundamental data for stocks. Return data in JSON format with no additional text. Return ONLY valid JSON without markdown code blocks.'
          },
          {
            role: 'user',
            content: `Provide the following fundamental data for ${symbol}: P/E Ratio, Market Cap, Dividend Yield, Beta. Format as JSON with these exact keys: peRatio, marketCap (in billions), dividendYield (as percentage), beta.`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        search_recency_filter: 'month',
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    let fundamentalData;
    
    try {
      // Parse the JSON response from Perplexity
      const responseText = data.choices[0].message.content;
      
      // Check if response is wrapped in markdown code blocks and remove them
      const jsonContent = responseText.replace(/```json|```/g, '').trim();
      
      console.log("Formatted response for parsing:", jsonContent);
      fundamentalData = JSON.parse(jsonContent);
    } catch (e) {
      console.error('Failed to parse Perplexity response:', e);
      
      // Fallback values
      fundamentalData = {
        peRatio: 'N/A',
        marketCap: 'N/A',
        dividendYield: 'N/A',
        beta: 'N/A'
      };
    }
    
    return fundamentalData;
  } catch (error) {
    console.error(`Error fetching fundamental data for ${symbol}:`, error);
    // Return fallback values
    return {
      peRatio: 'N/A',
      marketCap: 'N/A',
      dividendYield: 'N/A',
      beta: 'N/A'
    };
  }
};
