
import { finnhubService } from './finnhubService';

export interface MarketIndex {
  symbol: string;
  name: string;
  current: number;
  previous: number;
  history: number[];
  change?: number;
  changePercent?: number;
}

export interface FormattedMarketData {
  symbol: string;
  name: string;
  value: string;
  change: string;
  percentChange: string;
  trend: 'up' | 'down';
  sparkline: number[];
}

// Reduced set of market indices to avoid API rate limits
const marketIndices: MarketIndex[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    current: 4780.32,
    previous: 4756.87,
    history: Array.from({length: 24}, () => 4750 + Math.random() * 100)
  }
];

// Asian markets data - reduced set
const asianMarkets: MarketIndex[] = [
  { 
    symbol: 'N225',
    name: 'Nikkei 225', 
    current: 33408.39, 
    previous: 33539.17,
    history: Array.from({length: 24}, () => 33300 + Math.random() * 400)
  }
];

// European markets data - reduced set
const europeanMarkets: MarketIndex[] = [
  { 
    symbol: 'FTSE',
    name: 'FTSE 100', 
    current: 7512.58, 
    previous: 7477.73,
    history: Array.from({length: 24}, () => 7450 + Math.random() * 100)
  }
];

// Function to get formatted market data with priority on real API data
export async function getMarketData(): Promise<FormattedMarketData[]> {
  try {
    console.log("Fetching US market data from Finnhub...");
    const result = await finnhubService.getMajorIndices();
    
    // Filter out US markets and ensure we have the required data structure
    const usMarkets = processApiResult(result, "US Markets");
    
    if (usMarkets.length > 0) {
      console.log("Successfully fetched real US market data");
      return formatMarketIndices(usMarkets);
    } else {
      console.warn("No US market data returned, using fallback");
      return formatMarketIndices(marketIndices);
    }
  } catch (error) {
    console.error("Error fetching market data from Finnhub:", error);
    throw error; // Let the caller handle the error, no fallback to mock data
  }
}

// Function to get formatted Asian market data
export async function getAsianMarketData(): Promise<FormattedMarketData[]> {
  try {
    console.log("Fetching Asian market data from Finnhub...");
    const result = await finnhubService.getMajorIndices();
    
    // Filter out Asian markets and ensure we have the required data structure
    const asiaMarkets = processApiResult(result, "Asian Markets");
    
    if (asiaMarkets.length > 0) {
      console.log("Successfully fetched real Asian market data");
      return formatMarketIndices(asiaMarkets);
    } else {
      console.warn("No Asian market data returned, using fallback");
      return formatMarketIndices(asianMarkets);
    }
  } catch (error) {
    console.error("Error fetching Asian market data from Finnhub:", error);
    throw error; // Let the caller handle the error
  }
}

// Function to get formatted European market data
export async function getEuropeanMarketData(): Promise<FormattedMarketData[]> {
  try {
    console.log("Fetching European market data from Finnhub...");
    const result = await finnhubService.getMajorIndices();
    
    // Filter out European markets and ensure we have the required data structure
    const euroMarkets = processApiResult(result, "European Markets");
    
    if (euroMarkets.length > 0) {
      console.log("Successfully fetched real European market data");
      return formatMarketIndices(euroMarkets);
    } else {
      console.warn("No European market data returned, using fallback");
      return formatMarketIndices(europeanMarkets);
    }
  } catch (error) {
    console.error("Error fetching European market data from Finnhub:", error);
    throw error; // Let the caller handle the error
  }
}

// Helper function to process API results into the MarketIndex format
function processApiResult(result: any[], marketType: string): MarketIndex[] {
  if (!Array.isArray(result) || result.length === 0) {
    console.log(`No data returned for ${marketType}`);
    return [];
  }

  try {
    // Filter and convert API results to MarketIndex format
    return result
      .filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Filter based on market type
        if (marketType === "US Markets" && (item.symbol === "^GSPC")) {
          return true;
        } else if (marketType === "Asian Markets" && (item.symbol === "^N225")) {
          return true;
        } else if (marketType === "European Markets" && (item.symbol === "^FTSE")) {
          return true;
        }
        return false;
      })
      .map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        current: item.current || item.price || 0,
        previous: item.previous || item.prevClose || 0,
        change: item.change || 0,
        changePercent: item.changePercent || 0,
        history: item.history || Array.from({ length: 24 }, () => (item.current || item.price || 0) + ((Math.random() - 0.5) * (item.current || item.price || 100) * 0.02))
      })) as MarketIndex[];
  } catch (e) {
    console.error(`Error processing ${marketType} data:`, e);
    return [];
  }
}

// Helper function to format market indices
function formatMarketIndices(indices: MarketIndex[]): FormattedMarketData[] {
  return indices.map(index => {
    const change = index.change !== undefined ? index.change : (index.current - index.previous);
    const percentChange = index.changePercent !== undefined ? index.changePercent : ((change / index.previous) * 100);
    
    return {
      symbol: index.symbol,
      name: index.name,
      value: index.current.toFixed(2),
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2),
      trend: change >= 0 ? 'up' : 'down',
      sparkline: index.history
    };
  });
}

// Simulate real-time updates with API calls
export function startMarketDataUpdates(
  callback: (data: FormattedMarketData[]) => void, 
  interval = 30000 // Increased interval to reduce API calls
): () => void {
  const updateInterval = setInterval(async () => {
    try {
      console.log("Updating market data...");
      const result = await finnhubService.getMajorIndices();
      const usMarkets = processApiResult(result, "US Markets");
      if (usMarkets.length > 0) {
        callback(formatMarketIndices(usMarkets));
      } else {
        throw new Error("No US market data available from API");
      }
    } catch (error) {
      console.error("Error in market data update:", error);
      // Don't fall back to mock data, just show the error
    }
  }, interval);
  
  return () => clearInterval(updateInterval);
}
