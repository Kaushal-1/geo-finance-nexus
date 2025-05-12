
import { finnhubService } from './finnhubService';

export interface MarketIndex {
  symbol: string;
  name: string;
  current: number;
  previous: number;
  history: number[];
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

// Market data service with mock data
const marketIndices: MarketIndex[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    current: 4780.32,
    previous: 4756.87,
    history: Array.from({length: 24}, () => 4750 + Math.random() * 100)
  },
  {
    symbol: 'NDX',
    name: 'NASDAQ',
    current: 16724.23,
    previous: 16758.44,
    history: Array.from({length: 24}, () => 16700 + Math.random() * 200)
  },
  {
    symbol: 'DJI',
    name: 'Dow Jones',
    current: 38056.78,
    previous: 37990.45,
    history: Array.from({length: 24}, () => 37900 + Math.random() * 300)
  },
  {
    symbol: 'RUT',
    name: 'Russell 2000',
    current: 2012.15,
    previous: 2025.34,
    history: Array.from({length: 24}, () => 2000 + Math.random() * 50)
  }
];

// Asian markets data
const asianMarkets: MarketIndex[] = [
  { 
    symbol: 'N225',
    name: 'Nikkei 225', 
    current: 33408.39, 
    previous: 33539.17,
    history: Array.from({length: 24}, () => 33300 + Math.random() * 400)
  },
  { 
    symbol: 'HSI',
    name: 'Hang Seng', 
    current: 16042.71, 
    previous: 15789.07,
    history: Array.from({length: 24}, () => 15700 + Math.random() * 500)
  },
];

// European markets data
const europeanMarkets: MarketIndex[] = [
  { 
    symbol: 'FTSE',
    name: 'FTSE 100', 
    current: 7512.58, 
    previous: 7477.73,
    history: Array.from({length: 24}, () => 7450 + Math.random() * 100)
  },
  { 
    symbol: 'DAX',
    name: 'DAX', 
    current: 16634.08, 
    previous: 16704.54,
    history: Array.from({length: 24}, () => 16600 + Math.random() * 200)
  },
];

// Function to get formatted market data
export async function getMarketData(): Promise<FormattedMarketData[]> {
  try {
    const result = await finnhubService.getMajorIndices();
    
    // Filter out US markets and ensure we have the required data structure
    const usMarkets = processApiResult(result, "US Markets");
    return formatMarketIndices(usMarkets.length > 0 ? usMarkets : marketIndices);
  } catch (error) {
    console.error("Error fetching market data from Finnhub:", error);
    // Fallback to mock data
    return formatMarketIndices(marketIndices);
  }
}

// Function to get formatted Asian market data
export async function getAsianMarketData(): Promise<FormattedMarketData[]> {
  try {
    const result = await finnhubService.getMajorIndices();
    
    // Filter out Asian markets and ensure we have the required data structure
    const asiaMarkets = processApiResult(result, "Asian Markets");
    return formatMarketIndices(asiaMarkets.length > 0 ? asiaMarkets : asianMarkets);
  } catch (error) {
    console.error("Error fetching Asian market data from Finnhub:", error);
    // Fallback to mock data
    return formatMarketIndices(asianMarkets);
  }
}

// Function to get formatted European market data
export async function getEuropeanMarketData(): Promise<FormattedMarketData[]> {
  try {
    const result = await finnhubService.getMajorIndices();
    
    // Filter out European markets and ensure we have the required data structure
    const euroMarkets = processApiResult(result, "European Markets");
    return formatMarketIndices(euroMarkets.length > 0 ? euroMarkets : europeanMarkets);
  } catch (error) {
    console.error("Error fetching European market data from Finnhub:", error);
    // Fallback to mock data
    return formatMarketIndices(europeanMarkets);
  }
}

// Helper function to process API results into the MarketIndex format
function processApiResult(result: any[], marketType: string): MarketIndex[] {
  if (!Array.isArray(result) || result.length === 0) {
    return [];
  }

  try {
    // Filter and convert API results to MarketIndex format
    return result
      .filter(item => {
        if (!item || typeof item !== 'object' || item.error) return false;
        
        // Filter based on market type
        if (marketType === "US Markets" && (item.symbol === "^GSPC" || item.symbol === "^DJI" || item.symbol === "^IXIC" || item.symbol === "^RUT")) {
          return true;
        } else if (marketType === "Asian Markets" && (item.symbol === "^N225" || item.symbol === "^HSI")) {
          return true;
        } else if (marketType === "European Markets" && (item.symbol === "^FTSE" || item.symbol === "^GDAXI")) {
          return true;
        }
        return false;
      })
      .map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        current: item.price || 0,
        previous: item.prevClose || 0,
        history: Array.from({ length: 24 }, () => (item.price || 0) + ((Math.random() - 0.5) * (item.price || 100) * 0.02))
      }));
  } catch (e) {
    console.error(`Error processing ${marketType} data:`, e);
    return [];
  }
}

// Helper function to format market indices
function formatMarketIndices(indices: MarketIndex[]): FormattedMarketData[] {
  return indices.map(index => {
    const change = index.current - index.previous;
    const percentChange = (change / index.previous) * 100;
    
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

// Simulate real-time updates
export function startMarketDataUpdates(
  callback: (data: FormattedMarketData[]) => void, 
  interval = 5000
): () => void {
  const updateInterval = setInterval(async () => {
    try {
      const result = await finnhubService.getMajorIndices();
      const usMarkets = processApiResult(result, "US Markets");
      if (usMarkets.length > 0) {
        callback(formatMarketIndices(usMarkets));
      } else {
        // Fallback to updating mock data
        updateMockData();
        callback(formatMarketIndices(marketIndices));
      }
    } catch (error) {
      console.error("Error in market data update:", error);
      
      // Fallback to updating mock data
      updateMockData();
      callback(formatMarketIndices(marketIndices));
    }
  }, interval);
  
  return () => clearInterval(updateInterval);
}

// Helper function to update mock data
function updateMockData() {
  marketIndices.forEach(index => {
    const changeAmount = (Math.random() - 0.5) * 20;
    index.previous = index.current;
    index.current += changeAmount;
    index.history.push(index.current);
    index.history.shift();
  });
  
  asianMarkets.forEach(index => {
    const changeAmount = (Math.random() - 0.5) * 15;
    index.previous = index.current;
    index.current += changeAmount;
    index.history.push(index.current);
    index.history.shift();
  });

  europeanMarkets.forEach(index => {
    const changeAmount = (Math.random() - 0.5) * 18;
    index.previous = index.current;
    index.current += changeAmount;
    index.history.push(index.current);
    index.history.shift();
  });
}
