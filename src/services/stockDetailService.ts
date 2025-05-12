
import { finnhubService } from './finnhubService';
import { getPerplexityApiKey } from './chatService';

// Function to fetch stock historical data for a specific time period
export async function fetchStockHistoricalData(symbol: string, days = 15) {
  try {
    // Calculate date range (last X days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch candle data from Finnhub
    const candleData = await finnhubService.getCandles(symbol, 'D', startDate, endDate);
    
    return candleData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
}

// Function to get stock profile data
export async function fetchStockProfile(symbol: string) {
  try {
    // Fetch stock profile from Finnhub - this is a placeholder, 
    // the actual implementation depends on finnhubService capabilities
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=d0gs7ppr01qhao4vj9igd0gs7ppr01qhao4vj9j0`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    throw error;
  }
}

// Function to generate a summary analysis of the stock performance using Perplexity
export async function generateStockAnalysis(symbol: string, stockData: any) {
  try {
    const apiKey = getPerplexityApiKey();
    
    // Create a summary of the stock performance data to send to Perplexity
    let stockSummary = '';
    if (stockData && stockData.length > 0) {
      const firstPrice = stockData[0].close;
      const lastPrice = stockData[stockData.length - 1].close;
      const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      stockSummary = `
        Symbol: ${symbol}
        Starting Price (${stockData[0].timestamp.toLocaleDateString()}): ${firstPrice}
        Current Price (${stockData[stockData.length - 1].timestamp.toLocaleDateString()}): ${lastPrice}
        Percent Change: ${percentChange.toFixed(2)}%
        Highest Price: ${Math.max(...stockData.map((d: any) => d.high))}
        Lowest Price: ${Math.min(...stockData.map((d: any) => d.low))}
      `;
    }
    
    // Query for Perplexity API
    const query = `
      Analyze the following stock performance data for ${symbol} over the last 15 days:
      ${stockSummary}
      
      Provide a concise analysis of this stock's performance, including:
      1. Key price movements and trends
      2. Possible reasons for significant changes
      3. Comparison to overall market conditions
      4. A brief outlook based on this data
      
      Keep your response focused and professional.
    `;
    
    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst providing concise, data-driven stock analyses.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating analysis for ${symbol}:`, error);
    return "Unable to generate analysis at this time. Please try again later.";
  }
}

// Mock data for fallback when API limits are reached
export const mockStockData = [
  { timestamp: new Date('2025-04-28'), open: 150.25, high: 153.10, low: 149.80, close: 152.75, volume: 2500000 },
  { timestamp: new Date('2025-04-29'), open: 152.80, high: 155.50, low: 152.30, close: 154.20, volume: 3100000 },
  { timestamp: new Date('2025-04-30'), open: 154.50, high: 158.10, low: 154.00, close: 157.85, volume: 3600000 },
  { timestamp: new Date('2025-05-01'), open: 157.90, high: 159.75, low: 155.90, close: 159.10, volume: 2900000 },
  { timestamp: new Date('2025-05-02'), open: 159.30, high: 161.40, low: 158.60, close: 160.95, volume: 2700000 },
  { timestamp: new Date('2025-05-05'), open: 161.00, high: 162.80, low: 160.20, close: 162.30, volume: 2200000 },
  { timestamp: new Date('2025-05-06'), open: 162.50, high: 163.90, low: 161.70, close: 163.45, volume: 2400000 },
  { timestamp: new Date('2025-05-07'), open: 163.60, high: 165.20, low: 163.00, close: 164.75, volume: 2500000 },
  { timestamp: new Date('2025-05-08'), open: 164.80, high: 165.90, low: 163.50, close: 165.60, volume: 2600000 },
  { timestamp: new Date('2025-05-09'), open: 165.70, high: 166.50, low: 164.20, close: 166.10, volume: 2300000 },
  { timestamp: new Date('2025-05-10'), open: 166.15, high: 168.30, low: 165.80, close: 167.90, volume: 2700000 },
  { timestamp: new Date('2025-05-11'), open: 167.95, high: 169.40, low: 167.10, close: 169.20, volume: 2800000 },
  { timestamp: new Date('2025-05-12'), open: 169.30, high: 171.75, low: 168.90, close: 171.50, volume: 3200000 },
];
