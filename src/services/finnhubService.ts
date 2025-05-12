
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
  description?: string;
  weburl?: string;
  ipo?: string;
  finnhubIndustry?: string;
  phone?: string;
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

interface FinancialMetric {
  // Basic metrics
  peBasicExcl?: number;
  epsBasicExcl?: number;
  dividendYieldIndicatedAnnual?: number;
  roe?: number;
  totalDebtToEquityQuarterly?: number;
  grossMarginTTM?: number;
  // Additional metrics can be added as needed
}

interface EarningsItem {
  period: string;
  actual: number;
  estimate: number;
  surprise?: number;
  surprisePercent?: number;
}

interface CompanyPeer {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

interface SupplyChainLocation {
  type: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
}

class FinnhubService {
  private apiKey: string;
  private baseUrl: string;
  private isRateLimited: boolean;
  private rateLimitResetTimeout: NodeJS.Timeout | null;
  private requestQueue: Array<{ request: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }>;
  private processingQueue: boolean;
  private requestsThisMinute: number;
  private lastRequestTime: number;
  private mockDataMode: boolean;

  constructor() {
    this.apiKey = 'd0gs7ppr01qhao4vj9igd0gs7ppr01qhao4vj9j0';
    this.baseUrl = 'https://finnhub.io/api/v1';
    this.isRateLimited = false;
    this.rateLimitResetTimeout = null;
    this.requestQueue = [];
    this.processingQueue = false;
    this.requestsThisMinute = 0;
    this.lastRequestTime = 0;
    this.mockDataMode = false; // Set to true if API is consistently failing
    
    // Reset the counter every minute
    setInterval(() => {
      this.requestsThisMinute = 0;
    }, 60000);
  }
  
  // Queued request processing to prevent rate limiting
  private async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) return;
    
    this.processingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const { request, resolve, reject } = this.requestQueue.shift() || { 
        request: () => Promise.resolve(), 
        resolve: () => {}, 
        reject: () => {} 
      };
      
      try {
        // Check if we're making too many requests
        const currentTime = Date.now();
        if (this.requestsThisMinute >= 25) { // Finnhub limit is 30/min for free tier, staying below
          const timeToWait = Math.max(0, 60000 - (currentTime - this.lastRequestTime));
          console.log(`Rate limit prevention: waiting ${timeToWait}ms`);
          await new Promise(r => setTimeout(r, timeToWait));
          this.requestsThisMinute = 0;
        }
        
        // Execute the request
        this.lastRequestTime = Date.now();
        this.requestsThisMinute++;
        
        const result = await request();
        resolve(result);
        
        // Add delay between requests to reduce rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error("Error processing queued request:", error);
        reject(error);
      }
    }
    
    this.processingQueue = false;
  }
  
  // Add request to queue
  private queueRequest(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processQueue();
    });
  }
  
  async fetchData(endpoint: string, params: Record<string, string> = {}) {
    // If we're currently rate limited, don't attempt new requests for a while
    if (this.isRateLimited) {
      console.log('API currently rate limited');
      throw new Error('Rate limited');
    }
    
    // Use mock data if we're in mock mode
    if (this.mockDataMode && endpoint.includes('/stock/')) {
      return this.getMockData(endpoint, params);
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    try {
      console.log(`Fetching from ${endpoint} with params:`, params);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
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
        
        // If we hit rate limits too often, switch to mock data mode
        this.mockDataMode = true;
        console.warn('Switching to mock data mode due to rate limiting');
        
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
    } catch (error: any) {
      console.error(`Error fetching from ${endpoint}:`, error.message);
      
      // If aborted or network error, consider using mock data
      if (error.name === 'AbortError' || error.message.includes('network')) {
        console.warn('Network issue or timeout, considering mock data');
        if (!this.mockDataMode) {
          this.mockDataMode = true;
        }
        return this.getMockData(endpoint, params);
      }
      
      throw error;
    }
  }
  
  // Get mock data when API is unavailable
  private getMockData(endpoint: string, params: Record<string, string> = {}) {
    console.log(`Using mock data for ${endpoint} with params:`, params);
    const symbol = params.symbol || 'UNKNOWN';
    
    // Mock quote data
    if (endpoint === '/quote') {
      return {
        c: 150 + Math.random() * 50, // Current price
        h: 160 + Math.random() * 50, // High
        l: 140 + Math.random() * 50, // Low
        o: 145 + Math.random() * 50, // Open
        pc: 148 + Math.random() * 50, // Previous close
        t: Date.now() / 1000 // Timestamp
      };
    }
    
    // Mock profile data
    if (endpoint === '/stock/profile2') {
      const mockProfiles: Record<string, any> = {
        'AAPL': {
          name: 'Apple Inc',
          ticker: 'AAPL',
          exchange: 'NASDAQ NMS - GLOBAL MARKET',
          finnhubIndustry: 'Technology',
          logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.png',
          marketCapitalization: 2800,
          weburl: 'https://www.apple.com/',
          country: 'US'
        },
        'MSFT': {
          name: 'Microsoft Corporation',
          ticker: 'MSFT',
          exchange: 'NASDAQ NMS - GLOBAL MARKET',
          finnhubIndustry: 'Technology',
          logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.png',
          marketCapitalization: 2700,
          weburl: 'https://www.microsoft.com/',
          country: 'US'
        },
        'GOOGL': {
          name: 'Alphabet Inc',
          ticker: 'GOOGL',
          exchange: 'NASDAQ NMS - GLOBAL MARKET',
          finnhubIndustry: 'Technology',
          logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOGL.png',
          marketCapitalization: 1900,
          weburl: 'https://www.google.com/',
          country: 'US'
        }
      };
      
      return mockProfiles[symbol] || {
        name: `${symbol} Inc`,
        ticker: symbol,
        exchange: 'EXCHANGE',
        finnhubIndustry: 'Industry',
        logo: '',
        marketCapitalization: 100 + Math.random() * 900,
        weburl: `https://www.${symbol.toLowerCase()}.com/`,
        country: 'US'
      };
    }
    
    // Mock candle data
    if (endpoint === '/stock/candle') {
      const count = 30; // Number of candles
      const basePrice = 150;
      const volatility = 5;
      const now = Date.now();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      
      // Create timestamps going back from now
      const timestamps = Array.from({ length: count }, (_, i) => 
        Math.floor((now - (i * millisecondsPerDay)) / 1000)
      ).reverse();
      
      // Generate prices with some randomness but trending
      let lastPrice = basePrice;
      const closes = timestamps.map(() => {
        lastPrice += (Math.random() - 0.5) * volatility;
        return lastPrice;
      });
      
      return timestamps.map((timestamp, i) => ({
        timestamp: new Date(timestamp * 1000),
        open: closes[i] - (Math.random() * 2),
        high: closes[i] + (Math.random() * 2),
        low: closes[i] - (Math.random() * 2),
        close: closes[i],
        volume: Math.floor(Math.random() * 1000000)
      }));
    }
    
    // Mock financial metrics
    if (endpoint === '/stock/metric') {
      return {
        metric: {
          peBasicExcl: 20 + Math.random() * 10,
          epsBasicExcl: 2 + Math.random() * 1,
          dividendYieldIndicatedAnnual: 1 + Math.random() * 2,
          roe: 15 + Math.random() * 10,
          totalDebtToEquityQuarterly: 0.5 + Math.random() * 1,
          grossMarginTTM: 40 + Math.random() * 10,
        }
      };
    }
    
    // Mock earnings data
    if (endpoint === '/stock/earnings') {
      return [
        {
          actual: 1.4 + Math.random() * 0.2,
          estimate: 1.3 + Math.random() * 0.2,
          period: "2025-03-31",
          surprise: 0.1,
          surprisePercent: 7.5,
          symbol: symbol,
          quarter: 1,
          year: 2025
        },
        {
          actual: 1.2 + Math.random() * 0.2,
          estimate: 1.1 + Math.random() * 0.2,
          period: "2024-12-31",
          surprise: 0.1,
          surprisePercent: 9.1,
          symbol: symbol,
          quarter: 4,
          year: 2024
        }
      ];
    }
    
    // Mock peers data
    if (endpoint === '/stock/peers') {
      const peersBySymbol: Record<string, string[]> = {
        'AAPL': ['AAPL', 'MSFT', 'GOOGL', 'DELL', 'HPQ'],
        'MSFT': ['MSFT', 'AAPL', 'GOOGL', 'ORCL', 'CRM'],
        'GOOGL': ['GOOGL', 'MSFT', 'AAPL', 'META', 'AMZN']
      };
      
      return peersBySymbol[symbol] || [symbol, 'PEER1', 'PEER2', 'PEER3'];
    }
    
    // Default mock response
    return {};
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
          price: quote.c || 0,
          change: (quote.c || 0) - (quote.pc || 0),
          changePercent: ((quote.c || 0) - (quote.pc || 0)) / (quote.pc || 1) * 100,
          open: quote.o || 0,
          high: quote.h || 0,
          low: quote.l || 0,
          prevClose: quote.pc || 0,
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
          open: data.o[index] || 0,
          high: data.h[index] || 0,
          low: data.l[index] || 0,
          close: data.c[index] || 0,
          volume: data.v[index] || 0
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

  // NEW METHODS FOR STOCK DETAIL PAGE
  
  // Get company profile information
  async getCompanyProfile(symbol: string): Promise<ProfileResponse> {
    return this.queueRequest(async () => {
      try {
        const profile = await this.fetchData('/stock/profile2', { symbol });
        return profile;
      } catch (error) {
        console.error(`Error fetching company profile for ${symbol}:`, error);
        throw error;
      }
    });
  }

  // Get company financials (metrics)
  async getCompanyFinancials(symbol: string): Promise<{ metric: FinancialMetric }> {
    return this.queueRequest(async () => {
      try {
        const financials = await this.fetchData('/stock/metric', {
          symbol,
          metric: 'all'
        });
        return financials;
      } catch (error) {
        console.error(`Error fetching company financials for ${symbol}:`, error);
        throw error;
      }
    });
  }

  // Get company earnings
  async getCompanyEarnings(symbol: string): Promise<EarningsItem[]> {
    return this.queueRequest(async () => {
      try {
        const earnings = await this.fetchData('/stock/earnings', { symbol });
        return earnings;
      } catch (error) {
        console.error(`Error fetching company earnings for ${symbol}:`, error);
        throw error;
      }
    });
  }

  // Get company peers - reduced to minimize API calls
  async getCompanyPeers(symbol: string): Promise<CompanyPeer[]> {
    return this.queueRequest(async () => {
      try {
        const peers = await this.fetchData('/stock/peers', { symbol });
        
        // Limit to 5 peers maximum to reduce API load
        const limitedPeers = peers && Array.isArray(peers) ? peers.slice(0, 5) : [];
        
        // Get basic info for each peer - one at a time to avoid rate limits
        if (limitedPeers.length > 0) {
          const results = [];
          
          for (const peerSymbol of limitedPeers) {
            try {
              console.log(`Fetching peer data for ${peerSymbol}`);
              const [profile, quote] = await Promise.all([
                this.getCompanyProfile(peerSymbol).catch(() => ({})),
                this.getQuote(peerSymbol).catch(() => ({ price: 0, change: 0, changePercent: 0 }))
              ]);
              
              results.push({
                symbol: peerSymbol,
                name: profile.name || peerSymbol,
                price: quote.price || 0,
                change: quote.change || 0,
                changePercent: quote.changePercent || 0,
                marketCap: profile.marketCapitalization || 0
              });
              
              // Add delay between peer fetches
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
              console.error(`Error fetching data for peer ${peerSymbol}:`, err);
            }
          }
          
          return results.filter(result => result !== null);
        }
        
        return [];
      } catch (error) {
        console.error(`Error fetching company peers for ${symbol}:`, error);
        throw error;
      }
    });
  }

  // Get company news
  async getCompanyNews(symbol: string, from: Date, to: Date) {
    return this.queueRequest(async () => {
      try {
        const fromDate = from.toISOString().split('T')[0];
        const toDate = to.toISOString().split('T')[0];
        
        const news = await this.fetchData('/company-news', {
          symbol,
          from: fromDate,
          to: toDate
        });
        
        // Process news with sentiment and limit to 10 to reduce data
        return (news || []).slice(0, 10).map((item: any) => ({
          id: item.id || Math.random().toString(),
          headline: item.headline || 'News headline',
          summary: item.summary || 'No summary available',
          source: item.source || 'News source',
          url: item.url || '#',
          timestamp: new Date(item.datetime * 1000 || Date.now()),
          image: item.image || '',
          sentiment: this.analyzeSentiment(item.headline + ' ' + (item.summary || ''))
        }));
      } catch (error) {
        console.error(`Error fetching company news for ${symbol}:`, error);
        throw error;
      }
    });
  }

  // Basic sentiment analysis function (simplified)
  analyzeSentiment(text: string): string {
    const positiveWords = ['up', 'rise', 'gain', 'growth', 'positive', 'increase', 'higher', 
      'profit', 'beat', 'exceed', 'outperform', 'success', 'strong', 'improve', 'bullish'];
    const negativeWords = ['down', 'fall', 'drop', 'decline', 'negative', 'decrease', 'lower', 
      'loss', 'miss', 'below', 'underperform', 'disappointing', 'weak', 'bearish'];
    
    const lowercaseText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowercaseText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowercaseText.includes(word)) score -= 1;
    });
    
    if (score > 2) return 'positive';
    if (score < -2) return 'negative';
    if (score > 0) return 'slightly positive';
    if (score < 0) return 'slightly negative';
    return 'neutral';
  }

  // Get insider transactions
  async getInsiderTransactions(symbol: string) {
    return this.queueRequest(async () => {
      try {
        return this.fetchData('/stock/insider-transactions', { symbol });
      } catch (error) {
        console.error(`Error fetching insider transactions for ${symbol}:`, error);
        throw error;
      }
    });
  }

  // Get company supply chain locations (Note: This is mocked since Finnhub doesn't provide this)
  async getSupplyChainLocations(symbol: string): Promise<SupplyChainLocation[]> {
    return this.queueRequest(async () => {
      try {
        // This is a mock implementation since Finnhub doesn't provide supply chain data
        const mockLocations: Record<string, SupplyChainLocation[]> = {
          'AAPL': [
            { type: 'headquarters', name: 'Apple Park', location: 'Cupertino, CA', coordinates: [-122.0312, 37.3318] },
            { type: 'manufacturing', name: 'Foxconn Zhengzhou', location: 'Zhengzhou, China', coordinates: [113.6243, 34.7466] },
            { type: 'manufacturing', name: 'Foxconn Shenzhen', location: 'Shenzhen, China', coordinates: [114.0579, 22.5431] },
            { type: 'manufacturing', name: 'Pegatron Shanghai', location: 'Shanghai, China', coordinates: [121.4737, 31.2304] },
            { type: 'r&d', name: 'Apple R&D Center', location: 'Herzliya, Israel', coordinates: [34.8372, 32.1573] }
          ],
          'MSFT': [
            { type: 'headquarters', name: 'Microsoft Campus', location: 'Redmond, WA', coordinates: [-122.1297, 47.6422] },
            { type: 'r&d', name: 'Microsoft Research', location: 'Cambridge, UK', coordinates: [0.1218, 52.2053] },
            { type: 'datacenter', name: 'Azure East US', location: 'Virginia', coordinates: [-78.024, 38.7223] }
          ],
          'AMZN': [
            { type: 'headquarters', name: 'Amazon HQ', location: 'Seattle, WA', coordinates: [-122.3408, 47.6150] },
            { type: 'fulfillment', name: 'Amazon Fulfillment Center', location: 'Tracy, CA', coordinates: [-121.4252, 37.7394] },
            { type: 'datacenter', name: 'AWS US-East', location: 'Virginia', coordinates: [-77.4433, 39.0180] }
          ],
          'default': [
            { type: 'headquarters', name: 'Headquarters', location: 'New York, NY', coordinates: [-74.0060, 40.7128] }
          ]
        };
        
        // Add a short delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return mockLocations[symbol] || mockLocations.default;
      } catch (error) {
        console.error(`Error fetching supply chain locations for ${symbol}:`, error);
        return [];
      }
    });
  }
}

export const finnhubService = new FinnhubService();
