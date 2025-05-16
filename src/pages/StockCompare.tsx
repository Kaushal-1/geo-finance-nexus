
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightLeft, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  LineChart,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import StockComparisonChart from "@/components/trading/StockComparisonChart";
import StockSelector from "@/components/trading/StockSelector";
import TechnicalAnalysisPanel from "@/components/trading/TechnicalAnalysisPanel";
import StockNewsPanel from "@/components/trading/StockNewsPanel";
import StockRecommendation from "@/components/trading/StockRecommendation";
import { alpacaService } from "@/services/alpacaService";

const StockCompare = () => {
  const [stock1, setStock1] = useState("AAPL");
  const [stock2, setStock2] = useState("MSFT");
  const [timeframe, setTimeframe] = useState("1Day");
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimePrices, setRealTimePrices] = useState<{[key: string]: number}>({});
  
  // Handle comparison button click
  const handleCompare = useCallback(async () => {
    if (stock1 === stock2) {
      toast({
        title: "Cannot Compare",
        description: "Please select two different stocks for comparison",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setIsComparing(false);
    
    try {
      // Fetch initial price data
      const [stock1Data, stock2Data] = await Promise.all([
        alpacaService.getBars(stock1, timeframe),
        alpacaService.getBars(stock2, timeframe)
      ]);
      
      if (stock1Data && stock2Data) {
        // Get latest prices from the bar data
        if (stock1Data.length > 0 && stock2Data.length > 0) {
          setRealTimePrices({
            [stock1]: stock1Data[stock1Data.length - 1].c,
            [stock2]: stock2Data[stock2Data.length - 1].c
          });
          
          setIsComparing(true);
        }
      }
    } catch (error) {
      console.error("Error starting comparison:", error);
      toast({
        title: "Comparison Error",
        description: "Failed to start stock comparison",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [stock1, stock2, timeframe]);
  
  return (
    <div className="container p-4 md:p-6 mx-auto">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Confused which stock to buy?</h1>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Our Sonar API will help you analyze the stocks properly via in-depth analysis and real-time analysis of the selected stocks
        </p>
      </div>
      
      {/* Stock Selection */}
      <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Stock 1</label>
              <StockSelector 
                value={stock1}
                onChange={setStock1}
                disabled={isLoading}
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Stock 2</label>
              <StockSelector 
                value={stock2}
                onChange={setStock2}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleCompare}
              disabled={isLoading || !stock1 || !stock2}
              className="bg-teal-600 hover:bg-teal-700"
              size="lg"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Compare Stocks"}
            </Button>
          </div>
          
          {/* Time Period Selector */}
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {["1Day", "1Week", "1Month", "1Year"].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={timeframe === period ? "bg-teal-600 hover:bg-teal-700" : "border-gray-700"}
                >
                  {period.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Comparison Content - Only shown after clicking Compare */}
      {isComparing && (
        <>
          {/* Chart Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stock1}</span>
                  <span className="text-lg font-normal">
                    ${realTimePrices[stock1] ? realTimePrices[stock1].toFixed(2) : "Loading..."}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StockComparisonChart symbol={stock1} timeframe={timeframe} />
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stock2}</span>
                  <span className="text-lg font-normal">
                    ${realTimePrices[stock2] ? realTimePrices[stock2].toFixed(2) : "Loading..."}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StockComparisonChart symbol={stock2} timeframe={timeframe} />
              </CardContent>
            </Card>
          </div>
          
          {/* Technical Analysis Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TechnicalAnalysisPanel symbol={stock1} />
            <TechnicalAnalysisPanel symbol={stock2} />
          </div>
          
          {/* News Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StockNewsPanel symbol={stock1} />
            <StockNewsPanel symbol={stock2} />
          </div>
          
          {/* Buy Recommendation */}
          <StockRecommendation stock1={stock1} stock2={stock2} />
        </>
      )}
    </div>
  );
};

export default StockCompare;
