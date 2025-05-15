
import { useState, useCallback } from "react";
import { AlpacaAccount } from "@/types/alpaca";
import { getPerplexityApiKey } from "@/services/chatService";
import { toast } from "@/components/ui/use-toast";

export const useSonarAnalysis = () => {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [stockAnalysis, setStockAnalysis] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);

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

  return {
    analysisLoading,
    stockAnalysis,
    healthScore,
    runAccountAnalysis
  };
};
