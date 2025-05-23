
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSonarAnalysis } from "@/hooks/useSonarAnalysis";
import { toast } from "@/components/ui/use-toast";

interface StockAnalysisPanelProps {
  symbol: string;
}

interface Fundamental {
  peRatio: number;
  marketCap: number;
  dividendYield: number;
  beta: number;
  eps: number;
  roe: number;
  debtToEquity: number;
}

interface Technical {
  rsi: number;
  macd: string | number; 
  movingAverages: string;
  volumeAnalysis: string;
  supportLevel: number;
  resistanceLevel: number;
}

interface Summary {
  shortTermOutlook: string;
  longTermOutlook: string;
  riskLevel: string;
  strengthsWeaknesses: string[];
}

const StockAnalysisPanel: React.FC<StockAnalysisPanelProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [fundamental, setFundamental] = useState<Fundamental | null>(null);
  const [technical, setTechnical] = useState<Technical | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const { runNewsAnalysis } = useSonarAnalysis();
  
  // Safe formatter function to ensure we don't render objects directly
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      // If it's an object with type and value properties
      if (value.hasOwnProperty("type") && value.hasOwnProperty("value")) {
        return `${value.value} (${value.type})`;
      }
      // If it's an object with bullishBearish and value properties
      if (value.hasOwnProperty("bullishBearish") && value.hasOwnProperty("value")) {
        return `${value.value} (${value.bullishBearish})`;
      }
      // For other objects, return a placeholder
      return JSON.stringify(value);
    }
    return String(value);
  };
  
  // Fetch analysis data
  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      // Get news analysis which has the AI summary powered by Sonar
      const newsAnalysisResult = await runNewsAnalysis(symbol, {
        timeframe: "1month",
        limit: 5
      });
      
      if (newsAnalysisResult) {
        // Use Perplexity's sonar API for technical and fundamental data
        await fetchSonarData();
      } else {
        // If news analysis fails, use mock data
        mockAnalysisData();
      }
    } catch (error) {
      console.error(`Failed to fetch analysis for ${symbol}:`, error);
      mockAnalysisData(); // Use mock data as fallback
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data from Perplexity Sonar API
  const fetchSonarData = async () => {
    try {
      const apiKey = "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";
      
      // Build the query for fundamental data
      const fundamentalQuery = `Provide the following fundamental data for ${symbol}: 
      P/E Ratio, Market Cap (in billions), Dividend Yield (as percentage), Beta, 
      EPS, ROE, Debt to Equity Ratio. Format as JSON with these exact keys: 
      peRatio, marketCap, dividendYield, beta, eps, roe, debtToEquity.`;
      
      // Build the query for technical data
      const technicalQuery = `Provide the following technical analysis data for ${symbol}: 
      RSI (current value), MACD (bullish/bearish and value), Moving Averages summary, 
      Volume analysis, Support level, Resistance level. Format as JSON with these exact keys: 
      rsi, macd, movingAverages, volumeAnalysis, supportLevel, resistanceLevel.`;
      
      // Build the query for summary data
      const summaryQuery = `Provide an investment summary for ${symbol} including: 
      short term outlook (1-3 months), long term outlook (1-2 years), risk level (Low/Medium/High), 
      and list of strengths and weaknesses (at least 2 each). Format as JSON with these exact keys: 
      shortTermOutlook, longTermOutlook, riskLevel, strengthsWeaknesses.`;
      
      // Fetch fundamental data
      const fundamentalResponse = await fetchSonarResponse(fundamentalQuery, apiKey);
      if (fundamentalResponse) {
        // Process and sanitize the values
        const processedFundamental = {
          peRatio: typeof fundamentalResponse.peRatio === 'object' ? 20 : Number(fundamentalResponse.peRatio) || 0,
          marketCap: typeof fundamentalResponse.marketCap === 'object' ? 50 : Number(fundamentalResponse.marketCap) || 0,
          dividendYield: typeof fundamentalResponse.dividendYield === 'object' ? 1.5 : Number(fundamentalResponse.dividendYield) || 0,
          beta: typeof fundamentalResponse.beta === 'object' ? 1.2 : Number(fundamentalResponse.beta) || 0,
          eps: typeof fundamentalResponse.eps === 'object' ? 2.5 : Number(fundamentalResponse.eps) || 0,
          roe: typeof fundamentalResponse.roe === 'object' ? 15 : Number(fundamentalResponse.roe) || 0,
          debtToEquity: typeof fundamentalResponse.debtToEquity === 'object' ? 0.5 : Number(fundamentalResponse.debtToEquity) || 0,
        };
        setFundamental(processedFundamental);
      }
      
      // Fetch technical data
      const technicalResponse = await fetchSonarResponse(technicalQuery, apiKey);
      if (technicalResponse) {
        // Process and sanitize the values
        const processedTechnical = {
          rsi: typeof technicalResponse.rsi === 'object' ? 50 : Number(technicalResponse.rsi) || 0,
          macd: typeof technicalResponse.macd === 'object' ? 
            formatValue(technicalResponse.macd) : technicalResponse.macd,
          movingAverages: String(technicalResponse.movingAverages || "Neutral"),
          volumeAnalysis: String(technicalResponse.volumeAnalysis || "Average volume"),
          supportLevel: typeof technicalResponse.supportLevel === 'object' ? 
            150 : Number(technicalResponse.supportLevel) || 0,
          resistanceLevel: typeof technicalResponse.resistanceLevel === 'object' ? 
            200 : Number(technicalResponse.resistanceLevel) || 0,
        };
        setTechnical(processedTechnical);
      }
      
      // Fetch summary data
      const summaryResponse = await fetchSonarResponse(summaryQuery, apiKey);
      if (summaryResponse) {
        // Ensure strengthsWeaknesses is always an array of strings
        let processedStrengthsWeaknesses: string[] = [];
        
        if (summaryResponse.strengthsWeaknesses) {
          if (Array.isArray(summaryResponse.strengthsWeaknesses)) {
            processedStrengthsWeaknesses = summaryResponse.strengthsWeaknesses.map(item => {
              return typeof item === 'object' ? JSON.stringify(item) : String(item);
            });
          } else if (typeof summaryResponse.strengthsWeaknesses === 'string') {
            try {
              const parsed = JSON.parse(summaryResponse.strengthsWeaknesses);
              if (Array.isArray(parsed)) {
                processedStrengthsWeaknesses = parsed.map(String);
              } else {
                processedStrengthsWeaknesses = [String(summaryResponse.strengthsWeaknesses)];
              }
            } catch (e) {
              processedStrengthsWeaknesses = [String(summaryResponse.strengthsWeaknesses)];
            }
          } else {
            processedStrengthsWeaknesses = [];
          }
        }
        
        const processedSummary = {
          shortTermOutlook: String(summaryResponse.shortTermOutlook || "Neutral"),
          longTermOutlook: String(summaryResponse.longTermOutlook || "Stable"),
          riskLevel: String(summaryResponse.riskLevel || "Medium"),
          strengthsWeaknesses: processedStrengthsWeaknesses.length > 0 ? 
            processedStrengthsWeaknesses : 
            ["Strong financials", "Good market position", "Competition risks", "Market volatility"]
        };
        
        setSummary(processedSummary);
      }
    } catch (error) {
      console.error("Error fetching from Sonar API:", error);
      mockAnalysisData(); // Use mock data as fallback
    }
  };
  
  // Helper function to fetch data from Sonar API
  const fetchSonarResponse = async (query: string, apiKey: string) => {
    try {
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
              content: "You are a financial analyst AI that provides accurate and up-to-date data for stocks. Return data in JSON format with no additional text."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.1,
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
        jsonString = jsonString.trim();
        return JSON.parse(jsonString);
      }
      return null;
    } catch (error) {
      console.error("Error in Sonar API request:", error);
      return null;
    }
  };
  
  // Use mock data if API fails
  const mockAnalysisData = () => {
    // Fundamental data
    setFundamental({
      peRatio: symbol === "AAPL" ? 27.5 : 35.2,
      marketCap: symbol === "AAPL" ? 2800 : 2100,
      dividendYield: symbol === "AAPL" ? 0.55 : 0.8,
      beta: symbol === "AAPL" ? 1.2 : 1.1,
      eps: symbol === "AAPL" ? 6.42 : 2.98,
      roe: symbol === "AAPL" ? 160.09 : 43.22,
      debtToEquity: symbol === "AAPL" ? 1.5 : 0.9
    });
    
    // Technical data
    setTechnical({
      rsi: symbol === "AAPL" ? 62 : 48,
      macd: symbol === "AAPL" ? "Bullish (0.87)" : "Bearish (-0.34)",
      movingAverages: symbol === "AAPL" ? "Above 50-day and 200-day MA, showing strength" : "Below 50-day MA but above 200-day MA",
      volumeAnalysis: symbol === "AAPL" ? "Above average, indicating buying pressure" : "Below average, suggesting consolidation",
      supportLevel: symbol === "AAPL" ? 175.2 : 320.5,
      resistanceLevel: symbol === "AAPL" ? 195.8 : 345.2
    });
    
    // Summary data
    setSummary({
      shortTermOutlook: symbol === "AAPL" ? "Bullish with potential for 8-10% upside" : "Neutral with sideways trading expected",
      longTermOutlook: symbol === "AAPL" ? "Strong growth potential as AI initiatives mature" : "Positive outlook based on cloud dominance",
      riskLevel: symbol === "AAPL" ? "Medium" : "Medium-High",
      strengthsWeaknesses: symbol === "AAPL" 
        ? ["Strong cash position", "Loyal customer base", "Hardware dependency", "Increased competition"]
        : ["Market leader in cloud", "Diversified revenue streams", "High valuation multiples", "Regulatory concerns"]
    });
  };
  
  // Load data when component mounts or symbol changes
  useEffect(() => {
    fetchAnalysis();
  }, [symbol]);
  
  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{symbol} Analysis</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalysis} 
            disabled={isLoading}
            className="border-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="technical">
          <TabsList className="mb-4 bg-gray-900">
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical">
            {isLoading || !technical ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full bg-gray-800" />
                <Skeleton className="h-6 w-full bg-gray-800" />
                <Skeleton className="h-6 w-full bg-gray-800" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>RSI:</span>
                  <span className={technical.rsi > 70 ? "text-red-500" : technical.rsi < 30 ? "text-green-500" : "text-white"}>
                    {formatValue(technical.rsi)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>MACD:</span>
                  <span className={
                    typeof technical.macd === 'string' && technical.macd.includes("Bullish") 
                      ? "text-green-500" 
                      : "text-red-500"
                  }>
                    {formatValue(technical.macd)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Moving Averages:</span>
                  <span>{formatValue(technical.movingAverages)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span>{formatValue(technical.volumeAnalysis)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Support:</span>
                  <span>${formatValue(technical.supportLevel)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resistance:</span>
                  <span>${formatValue(technical.resistanceLevel)}</span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="fundamental">
            {isLoading || !fundamental ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full bg-gray-800" />
                <Skeleton className="h-6 w-full bg-gray-800" />
                <Skeleton className="h-6 w-full bg-gray-800" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>P/E Ratio:</span>
                  <span>{formatValue(fundamental.peRatio)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span>${formatValue(fundamental.marketCap)}B</span>
                </div>
                <div className="flex justify-between">
                  <span>Dividend Yield:</span>
                  <span>{formatValue(fundamental.dividendYield)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Beta:</span>
                  <span>{formatValue(fundamental.beta)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EPS:</span>
                  <span>${formatValue(fundamental.eps)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ROE:</span>
                  <span>{formatValue(fundamental.roe)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Debt to Equity:</span>
                  <span>{formatValue(fundamental.debtToEquity)}</span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary">
            {isLoading || !summary ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full bg-gray-800" />
                <Skeleton className="h-6 w-full bg-gray-800" />
                <Skeleton className="h-6 w-full bg-gray-800" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Short Term Outlook</p>
                  <p>{formatValue(summary.shortTermOutlook)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Long Term Outlook</p>
                  <p>{formatValue(summary.longTermOutlook)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Risk Level</p>
                  <p className={
                    summary.riskLevel === "High" ? "text-red-500" : 
                    summary.riskLevel === "Medium" ? "text-yellow-500" : 
                    "text-green-500"
                  }>
                    {formatValue(summary.riskLevel)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Strengths & Weaknesses</p>
                  <ul className="list-disc list-inside space-y-1">
                    {Array.isArray(summary.strengthsWeaknesses) && summary.strengthsWeaknesses.map((item, index) => (
                      <li key={index} className={index < 2 ? "text-green-500" : "text-red-500"}>
                        {formatValue(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockAnalysisPanel;
