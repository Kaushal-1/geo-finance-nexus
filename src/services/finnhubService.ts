class FinnhubService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'd0gs7ppr01qhao4vj9igd0gs7ppr01qhao4vj9j0';
    this.baseUrl = 'https://finnhub.io/api/v1';
  }
  
  async fetchData(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Get real-time quote
  async getQuote(symbol: string): Promise<FinnhubQuoteResult> {
    try {
      const [quote, profile] = await Promise.all([
        this.fetchData('/quote', { symbol }) as Promise<QuoteResponse>,
        this.fetchData('/stock/profile2', { symbol }) as Promise<ProfileResponse>
      ]);
      
      return {
        symbol: symbol,
        name: profile?.name || symbol,
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
  }
  
  // Get candle data (OHLC)
  async getCandles(symbol: string, resolution = 'D', fromDate: Date, toDate = new Date()) {
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
  }
  
  // Get major indices data
  async getMajorIndices() {
    // Map of index symbols to their names
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^RUT', name: 'Russell 2000' }
    ];
    
    const asianIndices = [
      { symbol: '^N225', name: 'Nikkei 225' },
      { symbol: '^HSI', name: 'Hang Seng' }
    ];
    
    const europeanIndices = [
      { symbol: '^FTSE', name: 'FTSE 100' },
      { symbol: '^GDAXI', name: 'DAX' }
    ];
    
    try {
      const [usResults, asianResults, europeanResults] = await Promise.all([
        Promise.all(indices.map(this.fetchIndexData.bind(this))),
        Promise.all(asianIndices.map(this.fetchIndexData.bind(this))),
        Promise.all(europeanIndices.map(this.fetchIndexData.bind(this)))
      ]);
      
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
  
  private async fetchIndexData(index: { symbol: string, name: string }) {
    try {
      const quote = await this.getQuote(index.symbol);
      return {
        symbol: index.symbol,
        name: index.name,
        current: quote.price,
        previous: quote.prevClose,
        history: Array.from({ length: 24 }, (_, i) => quote.price + (Math.random() - 0.5) * (quote.price * 0.01 * i / 24))
      };
    } catch (err) {
      console.error(`Error fetching data for ${index.name}:`, err);
      // Return fallback data
      return {
        symbol: index.symbol,
        name: index.name,
        current: 0,
        previous: 0,
        history: Array.from({ length: 24 }, () => 0)
      };
    }
  }
  
  // Get market news
  async getMarketNews(category = 'general') {
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
