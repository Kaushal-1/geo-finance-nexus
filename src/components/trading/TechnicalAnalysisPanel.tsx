
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getPerplexityApiKey } from "@/services/chatService";

interface TechnicalAnalysisPanelProps {
  symbol: string;
}

interface TechnicalData {
  currentPrice: number;
  weekHigh: number;
  weekLow: number;
  overallTrend: {
    value: string;
    percentage: number;
  };
  movingAverages: {
    status: string;
    day50: number;
    day200: number;
  };
  rsi: {
    value: number;
    status: string;
  };
  macd: {
    value: number;
    signal: number;
    histogram: number;
    status: string;
  };
  fundamentals: {
    peRatio: number;
    marketCap: string;
    dividendYield: string;
    beta: number;
  };
}

const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Safe formatter function to handle any type of value
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      if (value.hasOwnProperty("type") && value.hasOwnProperty("value")) {
        return `${value.value} (${value.type})`;
      }
      if (value.hasOwnProperty("bullishBearish") && value.hasOwnProperty("value")) {
        return `${value.value} (${value.bullishBearish})`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Determine color based on value comparison
  const getColorClass = (value: number, threshold: number = 0): string => {
    if (value > threshold) return "text-green-500";
    if (value < threshold) return "text-red-500";
    return "text-gray-300";
  };

  // Determine RSI status color
  const getRSIColorClass = (value: number): string => {
    if (value > 70) return "text-red-500";
    if (value < 30) return "text-green-500";
    return "text-gray-300";
  };

  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    return price >= 100 ? price.toFixed(2) : price.toFixed(3);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Calculate width for price position on slider
  const calculatePricePosition = (current: number, min: number, max: number): number => {
    const range = max - min;
    if (range === 0) return 50; // Default to middle if no range
    const position = ((current - min) / range) * 100;
    return Math.min(Math.max(position, 0), 100); // Clamp between 0-100
  };

  // Analyze trend direction
  const getTrendDirection = (ma50: number, ma200: number, currentPrice: number): string => {
    if (currentPrice > ma50 && ma50 > ma200) return "bullish";
    if (currentPrice < ma50 && ma50 < ma200) return "bearish";
    return "neutral";
  };

  // Fetch technical data using Perplexity Sonar API
  const fetchTechnicalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = getPerplexityApiKey();
      
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "Could not find Perplexity API key.",
          variant: "destructive",
        });
        setError("API key missing");
        setIsLoading(false);
        return;
      }

      // Build the query
      const query = `Provide detailed technical analysis for ${symbol} stock. Include:
      1. Current price
      2. 52-week range (high and low)
      3. Overall trend (bullish, bearish, or neutral) with percentage value
      4. Moving averages: 50-day and 200-day values and overall status (bullish, bearish, neutral)
      5. RSI value and status
      6. MACD values (main, signal, histogram) and status
      7. P/E ratio, market cap (in billions), dividend yield (as percentage), and beta
      
      Format response as JSON with the following structure:
      {
        "currentPrice": number,
        "weekHigh": number,
        "weekLow": number,
        "overallTrend": {
          "value": "bullish|bearish|neutral",
          "percentage": number
        },
        "movingAverages": {
          "status": "bullish|bearish|neutral",
          "day50": number,
          "day200": number
        },
        "rsi": {
          "value": number,
          "status": "overbought|neutral|oversold"
        },
        "macd": {
          "value": number,
          "signal": number,
          "histogram": number,
          "status": "bullish|bearish|neutral"
        },
        "fundamentals": {
          "peRatio": number,
          "marketCap": string,
          "dividendYield": string,
          "beta": number
        }
      }`;

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
              content: "You are a financial analyst specializing in technical stock analysis. Provide accurate, data-driven information about stocks formatted in clean JSON."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          search_recency_filter: "month"
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract JSON from the response with robust error handling
      try {
        // Try different methods to extract JSON
        let parsedData: TechnicalData | null = null;
        
        // Method 1: Look for code blocks
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = jsonPattern.exec(content);
        
        if (match && match[1]) {
          parsedData = JSON.parse(match[1]);
        } else {
          // Method 2: Try parsing the whole content
          try {
            parsedData = JSON.parse(content);
          } catch (innerError) {
            // Method 3: Try to find JSON-like structure with regex
            const jsonObjectPattern = /(\{[\s\S]*\})/;
            const objectMatch = jsonObjectPattern.exec(content);
            
            if (objectMatch && objectMatch[1]) {
              parsedData = JSON.parse(objectMatch[1]);
            }
          }
        }
        
        if (parsedData) {
          // Validate and sanitize the data
          const sanitizedData: TechnicalData = {
            currentPrice: typeof parsedData.currentPrice === 'number' ? parsedData.currentPrice : 0,
            weekHigh: typeof parsedData.weekHigh === 'number' ? parsedData.weekHigh : 0,
            weekLow: typeof parsedData.weekLow === 'number' ? parsedData.weekLow : 0,
            overallTrend: {
              value: parsedData.overallTrend?.value || 'neutral',
              percentage: typeof parsedData.overallTrend?.percentage === 'number' ? parsedData.overallTrend.percentage : 0
            },
            movingAverages: {
              status: parsedData.movingAverages?.status || 'neutral',
              day50: typeof parsedData.movingAverages?.day50 === 'number' ? parsedData.movingAverages.day50 : 0,
              day200: typeof parsedData.movingAverages?.day200 === 'number' ? parsedData.movingAverages.day200 : 0
            },
            rsi: {
              value: typeof parsedData.rsi?.value === 'number' ? parsedData.rsi.value : 50,
              status: parsedData.rsi?.status || 'neutral'
            },
            macd: {
              value: typeof parsedData.macd?.value === 'number' ? parsedData.macd.value : 0,
              signal: typeof parsedData.macd?.signal === 'number' ? parsedData.macd.signal : 0,
              histogram: typeof parsedData.macd?.histogram === 'number' ? parsedData.macd.histogram : 0,
              status: parsedData.macd?.status || 'neutral'
            },
            fundamentals: {
              peRatio: typeof parsedData.fundamentals?.peRatio === 'number' ? parsedData.fundamentals.peRatio : 0,
              marketCap: parsedData.fundamentals?.marketCap || 'N/A',
              dividendYield: parsedData.fundamentals?.dividendYield || 'N/A',
              beta: typeof parsedData.fundamentals?.beta === 'number' ? parsedData.fundamentals.beta : 1
            }
          };
          
          setTechnicalData(sanitizedData);
        } else {
          throw new Error("Could not extract valid JSON from API response");
        }
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        setError("Failed to parse data from API");
        // Use mock data as fallback
        setTechnicalData(generateMockData(symbol));
      }
    } catch (error) {
      console.error("Error fetching technical data:", error);
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Use mock data as fallback
      setTechnicalData(generateMockData(symbol));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data as fallback
  const generateMockData = (symbol: string): TechnicalData => {
    const basePrice = symbol === "AAPL" ? 211.53 : 450.31;
    const isApple = symbol === "AAPL";
    
    return {
      currentPrice: basePrice,
      weekHigh: basePrice * 1.01,
      weekLow: basePrice * 0.93,
      overallTrend: {
        value: isApple ? "neutral" : "bearish",
        percentage: isApple ? 57 : 29
      },
      movingAverages: {
        status: isApple ? "strong" : "neutral",
        day50: isApple ? 211.79 : 452.48,
        day200: isApple ? 211.38 : 452.38
      },
      rsi: {
        value: isApple ? 43.8 : 34.9,
        status: "neutral"
      },
      macd: {
        value: isApple ? 0.02 : -0.49,
        signal: isApple ? 0.07 : -0.30,
        histogram: isApple ? -0.05 : -0.19,
        status: "neutral"
      },
      fundamentals: {
        peRatio: isApple ? 27.99 : 34.06,
        marketCap: isApple ? "$2.5B" : "$2.5B",
        dividendYield: isApple ? "0.05%" : "0.02%",
        beta: isApple ? 1.29 : 0.93
      }
    };
  };

  // Fetch data when component mounts or symbol changes
  useEffect(() => {
    fetchTechnicalData();
  }, [symbol]);

  // Render a gauge chart for metrics like RSI, trend
  const renderGauge = (value: string, percentage: number, colorClass: string = "") => {
    return (
      <div className="flex flex-col items-center">
        <div className="w-32 h-16 relative">
          <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-t-full overflow-hidden opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div 
              className="h-10 w-0.5 bg-white origin-bottom transform -rotate-45" 
              style={{ 
                transform: `rotate(${(percentage / 100 * 180) - 90}deg)`,
                transformOrigin: 'bottom center' 
              }}
            ></div>
          </div>
          <div className={`absolute bottom-0 left-0 w-full text-center ${colorClass}`}>
            {value}
          </div>
        </div>
        <div className={`text-sm ${colorClass}`}>
          {percentage}% {value}
        </div>
      </div>
    );
  };

  // Render price range slider
  const renderRangeSlider = (current: number, min: number, max: number) => {
    const position = calculatePricePosition(current, min, max);
    
    return (
      <div className="mt-2 mb-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>${min.toFixed(2)}</span>
          <span>${max.toFixed(2)}</span>
        </div>
        <div className="relative w-full h-2 bg-gray-700 rounded-full mt-1">
          <div className="absolute w-2 h-6 bg-white rounded-full top-1/2 transform -translate-y-1/2"
               style={{ left: `${position}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Technical Analysis: {symbol}</span>
          <div className="flex items-center space-x-3">
            {technicalData && (
              <span className="text-xl font-normal">${formatPrice(technicalData.currentPrice)}</span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTechnicalData} 
              disabled={isLoading}
              className="border-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-gray-800" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full bg-gray-800" />
              <Skeleton className="h-32 w-full bg-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full bg-gray-800" />
              <Skeleton className="h-32 w-full bg-gray-800" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTechnicalData}
              className="mt-4 border-gray-700"
            >
              Try Again
            </Button>
          </div>
        ) : technicalData && (
          <div className="space-y-6">
            {/* 52-Week Range */}
            <div>
              <h3 className="text-sm text-gray-400 mb-1">52-Week Range</h3>
              {renderRangeSlider(
                technicalData.currentPrice,
                technicalData.weekLow,
                technicalData.weekHigh
              )}
            </div>
            
            {/* Overall Trend and Moving Averages */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-400 mb-4">Overall Trend</h3>
                <div className="flex justify-center">
                  {renderGauge(
                    technicalData.overallTrend.value,
                    technicalData.overallTrend.percentage,
                    technicalData.overallTrend.value === "bullish" 
                      ? "text-green-500" 
                      : technicalData.overallTrend.value === "bearish" 
                        ? "text-red-500" 
                        : "text-gray-300"
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-4">Moving Averages</h3>
                <div className="flex justify-center">
                  {renderGauge(
                    technicalData.movingAverages.status,
                    technicalData.movingAverages.status === "bullish" ? 80 :
                      technicalData.movingAverages.status === "bearish" ? 20 : 50,
                    technicalData.movingAverages.status === "bullish" || technicalData.movingAverages.status === "strong" 
                      ? "text-green-500" 
                      : technicalData.movingAverages.status === "bearish" 
                        ? "text-red-500" 
                        : "text-gray-300"
                  )}
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-400">50-day:</span>
                    <span className={getColorClass(technicalData.currentPrice - technicalData.movingAverages.day50)}>
                      ${formatPrice(technicalData.movingAverages.day50)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">200-day:</span>
                    <span className={getColorClass(technicalData.currentPrice - technicalData.movingAverages.day200)}>
                      ${formatPrice(technicalData.movingAverages.day200)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Current:</span>
                    <span>${formatPrice(technicalData.currentPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* RSI and MACD */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-400 mb-4">RSI ({technicalData.rsi.value.toFixed(1)})</h3>
                <div className="flex justify-center">
                  {renderGauge(
                    technicalData.rsi.status,
                    technicalData.rsi.value,
                    getRSIColorClass(technicalData.rsi.value)
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-green-500">Oversold</span>
                  <span>Neutral</span>
                  <span className="text-red-500">Overbought</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-4">MACD</h3>
                <div className="flex justify-center">
                  {renderGauge(
                    technicalData.macd.status,
                    technicalData.macd.status === "bullish" ? 70 :
                      technicalData.macd.status === "bearish" ? 30 : 50,
                    technicalData.macd.value > 0 
                      ? "text-green-500" 
                      : technicalData.macd.value < 0 
                        ? "text-red-500" 
                        : "text-gray-300"
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-400">MACD:</span>
                    <span className={getColorClass(technicalData.macd.value)}>
                      {technicalData.macd.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Signal:</span>
                    <span className={getColorClass(technicalData.macd.signal)}>
                      {technicalData.macd.signal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Hist:</span>
                    <span className={getColorClass(technicalData.macd.histogram)}>
                      {technicalData.macd.histogram.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fundamental Data */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3">Fundamental Data</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-900/50 rounded p-3">
                  <div className="text-xs text-gray-400">P/E Ratio</div>
                  <div className="text-lg">{technicalData.fundamentals.peRatio.toFixed(2)}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <div className="text-xs text-gray-400">Market Cap</div>
                  <div className="text-lg">{technicalData.fundamentals.marketCap}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <div className="text-xs text-gray-400">Dividend Yield</div>
                  <div className="text-lg">{technicalData.fundamentals.dividendYield}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <div className="text-xs text-gray-400">Beta</div>
                  <div className="text-lg">{technicalData.fundamentals.beta.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicalAnalysisPanel;
