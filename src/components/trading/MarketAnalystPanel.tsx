
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, TrendingUp, TrendingDown, BarChart2, DollarSign, Percent } from "lucide-react";
import { fetchStockMetrics, fetchFundamentalData } from "@/services/technicalAnalysisService";
import { toast } from "@/components/ui/use-toast";

interface MarketAnalystPanelProps {
  symbol: string;
}

const MarketAnalystPanel: React.FC<MarketAnalystPanelProps> = ({ symbol }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [fundamentals, setFundamentals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("technical");
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch technical metrics
      const metricsData = await fetchStockMetrics(symbol);
      setMetrics(metricsData);
      
      // Fetch fundamental data
      const fundamentalData = await fetchFundamentalData(symbol);
      setFundamentals(fundamentalData);
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      toast({
        title: "Data Error",
        description: `Failed to load analysis for ${symbol}. Please try again.`,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [symbol]);
  
  const getBadgeColor = (value: number, threshold1: number, threshold2: number) => {
    if (value < threshold1) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (value > threshold2) return "text-green-500 bg-green-500/10 border-green-500/20";
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  };
  
  const getRsiAnalysis = (rsi: number) => {
    if (rsi < 30) return "Potentially oversold";
    if (rsi > 70) return "Potentially overbought";
    return "Neutral";
  };
  
  const getMaAnalysis = (price: number, ma50: number, ma200: number) => {
    if (price > ma50 && ma50 > ma200) return "Strong uptrend";
    if (price > ma50 && ma50 < ma200) return "Bullish crossover";
    if (price < ma50 && ma50 > ma200) return "Bearish signal";
    if (price < ma50 && ma50 < ma200) return "Strong downtrend";
    return "Neutral";
  };
  
  const getMacdAnalysis = (macd: number, signal: number, histogram: number) => {
    if (macd > signal && histogram > 0) return "Bullish momentum";
    if (macd < signal && histogram < 0) return "Bearish momentum";
    if (macd > signal && histogram < 0) return "Weakening bullish momentum";
    if (macd < signal && histogram > 0) return "Weakening bearish momentum";
    return "Neutral";
  };
  
  if (isLoading || !metrics) {
    return (
      <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>AI Market Analyst</span>
            <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
              Beta
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 rounded-md bg-gray-800/50">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>AI Market Analyst: {symbol}</span>
            <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
              Beta
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-gray-700"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="technical">Technical Indicators</TabsTrigger>
            <TabsTrigger value="fundamental">Fundamental Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-4 rounded-md bg-gray-800/50">
                <h4 className="text-sm text-gray-400 mb-1">Current Price</h4>
                <div className="text-2xl font-bold">${metrics.currentPrice}</div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-800/50">
                <h4 className="text-sm text-gray-400 mb-1">52-Week Range</h4>
                <div className="text-lg">
                  <span className="text-red-400">${metrics.weekLow}</span>
                  <span className="mx-2">-</span>
                  <span className="text-green-400">${metrics.weekHigh}</span>
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-800/50">
                <h4 className="text-sm text-gray-400 mb-1">Volume</h4>
                <div className="text-lg">{metrics.volume.toLocaleString()}</div>
                <div className="text-sm mt-1">
                  <Badge className="font-normal">
                    {metrics.volumeTrend}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-800/50">
                <h4 className="text-sm text-gray-400 mb-1">Moving Averages</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-gray-400">50-day</div>
                    <div className="text-base">${metrics.ma50}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">200-day</div>
                    <div className="text-base">${metrics.ma200}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-md bg-gray-800/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">RSI (14)</h4>
                  <Badge className={getBadgeColor(metrics.rsi, 30, 70)}>
                    {metrics.rsi.toFixed(1)}
                  </Badge>
                </div>
                
                <Progress
                  value={metrics.rsi}
                  max={100}
                  className="h-2 mb-2"
                />
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Oversold</span>
                  <span>Neutral</span>
                  <span>Overbought</span>
                </div>
                
                <div className="mt-3 text-sm">
                  {metrics.rsi < 30 && <TrendingDown className="inline mr-1 h-4 w-4 text-red-500" />}
                  {metrics.rsi > 70 && <TrendingUp className="inline mr-1 h-4 w-4 text-green-500" />}
                  {getRsiAnalysis(metrics.rsi)}
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-800/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Moving Averages</h4>
                  <Badge
                    className={`${
                      metrics.currentPrice > metrics.ma50
                        ? "text-green-500 bg-green-500/10"
                        : "text-red-500 bg-red-500/10"
                    }`}
                  >
                    {metrics.currentPrice > metrics.ma50 ? "Above MA50" : "Below MA50"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-sm text-gray-400">Price vs MA50</div>
                    <div className="text-sm">
                      {((metrics.currentPrice / metrics.ma50 - 1) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">MA50 vs MA200</div>
                    <div className="text-sm">
                      {((metrics.ma50 / metrics.ma200 - 1) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  {metrics.currentPrice > metrics.ma50 && <TrendingUp className="inline mr-1 h-4 w-4 text-green-500" />}
                  {metrics.currentPrice < metrics.ma50 && <TrendingDown className="inline mr-1 h-4 w-4 text-red-500" />}
                  {getMaAnalysis(metrics.currentPrice, metrics.ma50, metrics.ma200)}
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-gray-800/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">MACD</h4>
                  <Badge
                    className={`${
                      metrics.macd > metrics.macdSignal
                        ? "text-green-500 bg-green-500/10"
                        : "text-red-500 bg-red-500/10"
                    }`}
                  >
                    {metrics.macd > metrics.macdSignal ? "Bullish" : "Bearish"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <div className="text-xs text-gray-400">MACD</div>
                    <div className="text-sm">{metrics.macd.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Signal</div>
                    <div className="text-sm">{metrics.macdSignal.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Histogram</div>
                    <div className="text-sm">{metrics.macdHistogram.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  {metrics.macd > metrics.macdSignal && metrics.macdHistogram > 0 && 
                    <TrendingUp className="inline mr-1 h-4 w-4 text-green-500" />}
                  {metrics.macd < metrics.macdSignal && metrics.macdHistogram < 0 && 
                    <TrendingDown className="inline mr-1 h-4 w-4 text-red-500" />}
                  {getMacdAnalysis(metrics.macd, metrics.macdSignal, metrics.macdHistogram)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fundamental" className="mt-4">
            {!fundamentals ? (
              <div className="text-center p-4">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-md bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-gray-400">P/E Ratio</h4>
                    <DollarSign className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold mt-2">{fundamentals.peRatio}</div>
                </div>
                
                <div className="p-4 rounded-md bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-gray-400">Market Cap</h4>
                    <BarChart2 className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold mt-2">{fundamentals.marketCap}</div>
                </div>
                
                <div className="p-4 rounded-md bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-gray-400">Dividend Yield</h4>
                    <Percent className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold mt-2">{fundamentals.dividendYield}</div>
                </div>
                
                <div className="p-4 rounded-md bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-gray-400">Beta</h4>
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold mt-2">{fundamentals.beta}</div>
                </div>
              </div>
            )}
            
            <div className="mt-4 p-4 rounded-md bg-blue-900/20 border border-blue-800/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-blue-400">Important Note</h3>
              </div>
              <p className="mt-2 text-sm text-blue-300">
                Fundamental data is provided by AI analysis and may not reflect real-time values. 
                For the most accurate information, please refer to official financial reports.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-gray-400 text-right">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAnalystPanel;
