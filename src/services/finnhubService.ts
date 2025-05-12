
// Define interfaces for API responses
interface QuoteResponse {
  c: number;  // Current price
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface ProfileResponse {
  name?: string;
  ticker?: string;
  country?: string;
  currency?: string;
  exchange?: string;
  marketCapitalization?: number;
  logo?: string;
}

interface CandleResponse {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status of the response ("ok" or "no_data")
  t: number[];  // Timestamps
  v: number[];  // Volumes
}

interface FinnhubQuoteResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  timestamp: Date;
}

interface NewsItem {
  id: number | string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image?: string;
  category: string;
  related?: string;
}

class FinnhubService {
  private apiKey: string;
  private baseUrl: string;
  private isRateLimited: boolean;
  private rateLimitResetTimeout: NodeJS.Timeout | null;
  private requestQueue: Array<() => Promise<any>>;
  private processingQueue: boolean;

  constructor() {
    this.apiKey = 'd0gs7ppr01qhao4vj9igd0gs7ppr01qhao4vj9j0';
    this.baseUrl = 'https://finnhub.io/api/v1';
    this.isRateLimited = false;
    this.rateLimitResetTimeout = null;
    this.requestQueue = [];
    this.processingQueue = false;
  }
  
  // Queued request processing to prevent rate limiting
  private async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) return;
    
    this.processingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          // Add delay between requests to reduce rate limiting
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.error("Error processing queued request:", error);
        }
      }
    }
    
    this.processingQueue = false;
  }
  
  // Add request to queue
  private queueRequest(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      this.requestQueue.push(wrappedRequest);
      this.processQueue();
    });
  }
  
  async fetchData(endpoint: string, params: Record<string, string> = {}) {
    // If we're currently rate limited, don't attempt new requests for a while
    if (this.isRateLimited) {
      console.log('API currently rate limited');
      throw new Error('Rate limited');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    try {
      console.log(`Fetching from ${endpoint} with params:`, params);
      const response = await fetch(url.toString());
      
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('Finnhub API rate limit reached. Waiting before retrying...');
        this.isRateLimited = true;
        
        // Reset rate limit flag after 1 minute
        if (this.rateLimitResetTimeout) {
          clearTimeout(this.rateLimitResetTimeout);
        }
        
        this.rateLimitResetTimeout = setTimeout(() => {
          console.log('Finnhub API rate limit reset');
          this.isRateLimited = false;
          this.rateLimitResetTimeout = null;
          // Process pending requests after rate limit resets
          this.processQueue();
        }, 60000); // 1 minute cooldown
        
        throw new Error('API rate limit reached');
      }
      
      if (response.status === 403) {
        console.error(`Access forbidden for endpoint ${endpoint}. Symbol may not be accessible with free plan.`);
        throw new Error(`API access forbidden for ${params.symbol || endpoint}`);
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for error in response data
      if (data && data.error) {
        console.error(`API returned error for ${endpoint}:`, data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Get real-time quote with rate limit management
  async getQuote(symbol: string): Promise<FinnhubQuoteResult> {
    return this.queueRequest(async () => {
      try {
        const [quote, profile] = await Promise.all([
          this.fetchData('/quote', { symbol }),
          this.fetchData('/stock/profile2', { symbol })
        ]);
        
        // Handle API responses with error message
        if (quote.error) {
          throw new Error(quote.error);
        }
        
        return {
          symbol: symbol,
          name: profile?.name || symbol.replace('^', ''),
          price: quote.c,
          change: quote.c - quote.pc,
          changePercent: ((quote.c - quote.pc) / quote.pc) * 100,
          open: quote.o,
          high: quote.h,
          low: quote.l,
          prevClose: quote.pc,
          timestamp: new Date()
        };
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        throw error;
      }
    });
  }
  
  // Get candle data (OHLC)
  async getCandles(symbol: string, resolution = 'D', fromDate: Date, toDate = new Date()) {
    return this.queueRequest(async () => {
      try {
        // Convert dates to UNIX timestamps
        const from = Math.floor(new Date(fromDate).getTime() / 1000);
        const to = Math.floor(toDate.getTime() / 1000);
        
        const data = await this.fetchData('/stock/candle', {
          symbol,
          resolution,
          from: from.toString(),
          to: to.toString()
        }) as CandleResponse;
        
        if (data.s !== 'ok') {
          throw new Error(`Failed to get candles: ${data.s}`);
        }
        
        // Convert to array of candles
        return data.t.map((time: number, index: number) => ({
          timestamp: new Date(time * 1000),
          open: data.o[index],
          high: data.h[index],
          low: data.l[index],
          close: data.c[index],
          volume: data.v[index]
        }));
      } catch (error) {
        console.error(`Error fetching candles for ${symbol}:`, error);
        throw error;
      }
    });
  }
  
  // Get major indices data - reduced number for rate limit management
  async getMajorIndices() {
    // Reduced list of indices to minimize rate limiting
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500' }  // Focus on just S&P 500 for US
    ];
    
    const asianIndices = [
      { symbol: '^N225', name: 'Nikkei 225' } // Just one Asian index
    ];
    
    const europeanIndices = [
      { symbol: '^FTSE', name: 'FTSE 100' }  // Just one European index
    ];
    
    try {
      console.log("Fetching major indices data...");
      
      const fetchIndexWithRetry = async (index: { symbol: string; name: string }) => {
        try {
          return await this.fetchIndexData(index);
        } catch (error) {
          console.warn(`Failed to fetch ${index.name}, will retry once...`);
          // Wait 2 seconds and retry once
          await new Promise(resolve => setTimeout(resolve, 2000));
          return await this.fetchIndexData(index);
        }
      };
      
      // Process one region at a time to minimize concurrent requests
      const usResults = await Promise.all(indices.map(fetchIndexWithRetry));
      
      // Add delay before next region
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const asianResults = await Promise.all(asianIndices.map(fetchIndexWithRetry));
      
      // Add delay before next region
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const europeanResults = await Promise.all(europeanIndices.map(fetchIndexWithRetry));
      
      return [
        ...usResults,
        ...asianResults,
        ...europeanResults
      ];
    } catch (error) {
      console.error('Error fetching indices:', error);
      throw error;
    }
  }
  
  private async fetchIndexData(index: { symbol: string; name: string }) {
    return this.queueRequest(async () => {
      try {
        console.log(`Fetching data for ${index.name}...`);
        const quote = await this.getQuote(index.symbol);
        
        // Calculate 24 historical points (approximation since we don't fetch historical data)
        // We'll create synthetic history data based on current price and some random variation
        const history = Array.from({ length: 24 }, (_, i) => {
          const baseValue = quote.price * (1 - 0.05 * Math.random());
          const trend = i / 24; // Trending upward over time
          return baseValue * (1 + trend * 0.05);
        });
        
        return {
          symbol: index.symbol,
          name: index.name,
          price: quote.price,
          current: quote.price,
          previous: quote.prevClose,
          change: quote.change,
          changePercent: quote.changePercent,
          history: history
        };
      } catch (err) {
        console.error(`Error fetching data for ${index.name}:`, err);
        throw err;
      }
    });
  }
  
  // Get market news
  async getMarketNews(category = 'general') {
    return this.queueRequest(async () => {
      try {
        const news = await this.fetchData('/news', { category }) as NewsItem[];
        
        return news.map((item: NewsItem) => ({
          id: item.id.toString(),
          title: item.headline,
          summary: item.summary,
          source: item.source,
          url: item.url,
          timestamp: new Date(item.datetime * 1000).toLocaleString(),
          image: item.image,
          category: this.categorizeNews(item.category, item.headline),
          credibilityScore: Math.floor(70 + Math.random() * 30), // Mock credibility score
          impact: this.getNewsImpact(),
          impactColor: this.getImpactColor()
        }));
      } catch (error) {
        console.error('Error fetching market news:', error);
        throw error;
      }
    });
  }
  
  // Helper method to generate random news impact
  private getNewsImpact(): string {
    const impacts = ["High Impact", "Medium Impact", "Low Impact"];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }
  
  // Helper method to get color based on impact
  private getImpactColor(): string {
    const colors = ["#ff5252", "#ffab40", "#69f0ae"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Helper method to categorize news
  private categorizeNews(apiCategory: string, headline: string): string {
    // Map API categories to our UI categories
    if (apiCategory === "general") {
      // Try to determine category from headline
      const lowerHeadline = headline.toLowerCase();
      
      if (lowerHeadline.includes("crypto") || lowerHeadline.includes("bitcoin") || lowerHeadline.includes("blockchain")) {
        return "Crypto";
      } else if (lowerHeadline.includes("tech") || lowerHeadline.includes("technology")) {
        return "Technology";
      } else if (lowerHeadline.includes("economy") || lowerHeadline.includes("economic")) {
        return "Economy";
      } else {
        return "Markets"; // Default
      }
    } else if (apiCategory === "forex") {
      return "Markets";
    } else if (apiCategory === "crypto") {
      return "Crypto";
    } else if (apiCategory === "merger") {
      return "Markets";
    } else if (apiCategory === "economy") {
      return "Economy";
    } else {
      return "Markets"; // Default fallback
    }
  }
}

export const finnhubService = new FinnhubService();
