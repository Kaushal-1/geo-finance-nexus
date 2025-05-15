
import { useState, useCallback } from "react";
import { AlpacaAccount } from "@/types/alpaca";
import { getPerplexityApiKey } from "@/services/chatService";
import { toast } from "@/components/ui/use-toast";

export interface NewsAnalysisParams {
  timeframe?: string;
  limit?: number;
  symbols?: string[];
  includeMarketNews?: boolean;
}

export interface NewsAnalysisData {
  newsItems: NewsItem[];
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  healthScore: number;
  summary: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  publishedAt: string;
  impact: 'High' | 'Medium' | 'Low';
}

export const useSonarAnalysis = () => {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [stockAnalysis, setStockAnalysis] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [newsAnalysisData, setNewsAnalysisData] = useState<NewsAnalysisData | null>(null);

  const runAccountAnalysis = useCallback(async (account: AlpacaAccount, orders: any[] = []) => {
    setAnalysisLoading(true);
    
    try {
      // Get the API key
      const apiKey = getPerplexityApiKey();
      
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "Please set the Perplexity API key in your account settings.",
          variant: "destructive",
        });
        return;
      }

      // Prepare account summary for analysis
      const accountSummary = {
        equity: parseFloat(account.equity),
        cash: parseFloat(account.cash),
        buying_power: parseFloat(account.buying_power),
        long_market_value: parseFloat(account.long_market_value),
        short_market_value: parseFloat(account.short_market_value),
        initial_margin: parseFloat(account.initial_margin),
        maintenance_margin: parseFloat(account.maintenance_margin),
        day_trade_count: account.pattern_day_trader ? "Yes" : "No",
        recent_orders: orders.slice(0, 5).map(order => ({
          symbol: order.symbol,
          side: order.side,
          qty: order.qty,
          type: order.type,
          status: order.status
        }))
      };

      // Construct the query
      const query = `Analyze this trading account portfolio with current date of May 2025:
      ${JSON.stringify(accountSummary)}
      
      Provide a brief analysis of portfolio health, diversification, risk factors, and recommendations for improvement. 
      Format as JSON with these keys: summary (string with analysis, max 150 words), healthScore (number 0-100).`;

      // Call the Perplexity Sonar API
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a financial analyst that provides portfolio assessment and recommendations. Analyze the given trading account data and provide concise insights. Be direct and specific in your recommendations."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract JSON from the response
      const jsonPattern = /```json([\s\S]*?)```|({[\s\S]*})/;
      const match = jsonPattern.exec(content);
      
      if (match) {
        let jsonString = match[1] || match[2];
        // Clean up the string
        jsonString = jsonString.trim();
        
        const parsedData = JSON.parse(jsonString);
        
        setStockAnalysis(parsedData.summary);
        setHealthScore(parsedData.healthScore);
        
        return parsedData;
      } else {
        console.error("Failed to extract JSON from response:", content);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error running account analysis:", error);
      toast({
        title: "Analysis Failed",
        description: `Could not complete account analysis. ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const runNewsAnalysis = useCallback(async (symbol: string, params: NewsAnalysisParams = {}) => {
    setAnalysisLoading(true);
    
    try {
      // Get the API key
      const apiKey = getPerplexityApiKey();
      
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "Please set the Perplexity API key in your account settings.",
          variant: "destructive",
        });
        return null;
      }

      // Default parameters
      const timeframe = params.timeframe || "1month";
      const limit = params.limit || 5;
      const includeMarketNews = params.includeMarketNews || true;

      // Construct the query
      const query = `Analyze recent news for ${symbol} stock with current date of May 2025.
      
      Provide a comprehensive news analysis including:
      1. The most relevant ${limit} news items from the past ${timeframe}
      2. For each news item: title, summary, source, URL, sentiment (Bullish/Bearish/Neutral), and publish date
      3. Overall market sentiment for this stock based on news (Bullish/Bearish/Neutral)
      4. A health score from 0-100 reflecting market perception
      5. A brief summary of the news impact (max 100 words)
      
      ${includeMarketNews ? "Include relevant broader market news that may impact this stock." : "Focus only on company-specific news."}
      
      Format as JSON with these keys: newsItems (array of news objects), sentiment (string), healthScore (number), summary (string).`;

      // Call the Perplexity Sonar API
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a financial news analyst specializing in stock market data. Analyze relevant news for the requested stock and provide structured insights. Be factual and cite sources."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1500,
          search_recency_filter: timeframe === "1week" ? "week" : "month"
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract JSON from the response
      const jsonPattern = /```json([\s\S]*?)```|({[\s\S]*})/;
      const match = jsonPattern.exec(content);
      
      if (match) {
        let jsonString = match[1] || match[2];
        // Clean up the string
        jsonString = jsonString.trim();
        
        const parsedData = JSON.parse(jsonString);
        
        // Process and add impact levels if not provided
        const processedData = {
          ...parsedData,
          newsItems: parsedData.newsItems.map((item: any) => ({
            ...item,
            impact: item.impact || determineImpact(item.title, item.summary, item.sentiment)
          }))
        };
        
        setNewsAnalysisData(processedData);
        return processedData;
      } else {
        console.error("Failed to extract JSON from response:", content);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error running news analysis:", error);
      toast({
        title: "News Analysis Failed",
        description: `Could not complete news analysis. ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  // Helper function to determine impact level based on content
  const determineImpact = (title: string, summary: string, sentiment: string): 'High' | 'Medium' | 'Low' => {
    const text = (title + ' ' + summary).toLowerCase();
    
    const highImpactTerms = ['significant', 'major', 'breaking', 'crash', 'surge', 
      'earnings', 'acquisition', 'merger', 'bankruptcy', 'lawsuit'];
    
    const mediumImpactTerms = ['partnership', 'expansion', 'growth', 'decline', 
      'restructuring', 'investment', 'regulation'];
    
    // Check for high impact terms
    if (highImpactTerms.some(term => text.includes(term))) {
      return 'High';
    }
    
    // Check for medium impact terms
    if (mediumImpactTerms.some(term => text.includes(term))) {
      return 'Medium';
    }
    
    // Default to low impact
    return 'Low';
  };

  return {
    analysisLoading,
    stockAnalysis,
    healthScore,
    newsAnalysisData,
    runAccountAnalysis,
    runNewsAnalysis
  };
};
