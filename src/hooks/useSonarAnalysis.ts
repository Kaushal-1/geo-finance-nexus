
import { useState, useCallback } from "react";
import { AlpacaAccount } from "@/types/alpaca";
import { getPerplexityApiKey } from "@/services/chatService";
import { toast } from "@/components/ui/use-toast";

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  credibilityScore?: number;
}

export interface SonarAnalysisResult {
  summary: string;
  healthScore: number;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  citations?: Array<{ text: string, url: string }>;
  news: NewsItem[];
}

export const useSonarAnalysis = () => {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [stockAnalysis, setStockAnalysis] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [sentiment, setSentiment] = useState<"Bullish" | "Bearish" | "Neutral" | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [citations, setCitations] = useState<Array<{ text: string, url: string }>>([]);

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
        return null;
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
      Format as JSON with these keys: summary (string with analysis, max 150 words), healthScore (number 0-100), sentiment (string: "Bullish", "Bearish", or "Neutral"), news (array of news items with title, summary, source, url, and sentiment).`;

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
              content: "You are a financial analyst that provides portfolio assessment and recommendations. Analyze the given trading account data and provide concise insights with real-time news that impacts the portfolio. Be direct and specific in your recommendations."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
          search_recency_filter: "month"
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
        
        const parsedData: SonarAnalysisResult = JSON.parse(jsonString);
        
        setStockAnalysis(parsedData.summary);
        setHealthScore(parsedData.healthScore);
        setSentiment(parsedData.sentiment);
        setNewsItems(parsedData.news || []);
        setCitations(parsedData.citations || []);
        
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

  const runStockAnalysis = useCallback(async (symbol: string) => {
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

      // Construct the query for stock analysis
      const query = `Provide a comprehensive analysis of ${symbol} stock in May 2025. Include: 
      1) Recent performance summary, 
      2) Key news events, 
      3) Overall sentiment (Bullish/Bearish/Neutral). 
      Format as JSON with these keys: summary (string), healthScore (number 0-100), sentiment (string: "Bullish", "Bearish", or "Neutral"), citations (array of {text, url}), news (array of {title, summary, source, url, sentiment}).`;

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
              content: "You are a financial analyst that provides data about stocks in structured JSON format. Use online search to find the most up-to-date information available. Cite your sources in the response."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1500,
          search_recency_filter: "month"
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
        
        const parsedData: SonarAnalysisResult = JSON.parse(jsonString);
        
        setStockAnalysis(parsedData.summary);
        setHealthScore(parsedData.healthScore);
        setSentiment(parsedData.sentiment);
        setNewsItems(parsedData.news || []);
        setCitations(parsedData.citations || []);
        
        return parsedData;
      } else {
        console.error("Failed to extract JSON from response:", content);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error running stock analysis:", error);
      toast({
        title: "Analysis Failed",
        description: `Could not complete analysis for this stock. ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  return {
    analysisLoading,
    stockAnalysis,
    healthScore,
    sentiment,
    newsItems,
    citations,
    runAccountAnalysis,
    runStockAnalysis
  };
};
