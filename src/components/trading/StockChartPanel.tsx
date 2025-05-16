
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import StockChart from "./StockChart";
import StockSelector from "./StockSelector";
import { alpacaService } from "@/services/alpacaService";

interface Bar {
  t: string; // timestamp
  o: number; // open
  h: number; // low
  l: number; // high
  c: number; // close
  v: number; // volume
}

interface StockChartPanelProps {
  onSymbolChange?: (symbol: string) => void;
}

// Timeframe options
const TIMEFRAMES = [
  { value: "1Day", label: "1D" },
  { value: "5Day", label: "5D" },
  { value: "1Week", label: "1W" },
  { value: "1Month", label: "1M" }
];

const StockChartPanel: React.FC<StockChartPanelProps> = ({ onSymbolChange }) => {
  const [symbol, setSymbol] = useState("AAPL"); // Default symbol
  const [chartData, setChartData] = useState<{ [symbol: string]: Bar[] }>({});
  const [timeframe, setTimeframe] = useState("1Day");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [priceInfo, setPriceInfo] = useState({ current: 0, change: 0, changePercent: 0 });
  
  // Function to fetch stock data
  const fetchStockData = useCallback(async () => {
    console.log(`Fetching stock data for ${symbol} with timeframe ${timeframe}`);
    setIsLoading(true);
    try {
      // Set appropriate limit based on timeframe
      let limit = 60; // Default
      if (timeframe === "5Day") limit = 5 * 24; // 5 days of hourly bars
      if (timeframe === "1Week") limit = 7 * 24; // 7 days of hourly bars
      if (timeframe === "1Month") limit = 30; // 30 daily bars
      
      const response = await alpacaService.getBars(symbol, timeframe, limit);
      console.log("Stock data response:", response);
      if (response && Array.isArray(response)) {
        // Ensure bars are sorted by time
        const sortedData = [...response].sort((a, b) => 
          new Date(a.t).getTime() - new Date(b.t).getTime()
        );
        
        setChartData({ [symbol]: sortedData });
        
        // Calculate price info
        if (sortedData.length > 0) {
          const latestBar = sortedData[sortedData.length - 1];
          const firstBar = sortedData[0];
          const priceChange = latestBar.c - firstBar.c;
          const priceChangePercent = (priceChange / firstBar.c) * 100;
          
          setPriceInfo({
            current: latestBar.c,
            change: priceChange,
            changePercent: priceChangePercent
          });
        }
      } else {
        console.error("Invalid response format:", response);
        setChartData({});
        toast({
          title: "Data Error",
          description: `Could not load chart data for ${symbol}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
      toast({
        title: "Chart Error",
        description: `Failed to load ${symbol} data: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: 5000
      });
      setChartData({});
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);
  
  // Function to handle stock selection
  const handleSelectStock = (newSymbol: string) => {
    console.log(`Selecting stock: ${newSymbol}`);
    setSymbol(newSymbol);
    
    // Call the onSymbolChange callback if provided
    if (onSymbolChange) {
      onSymbolChange(newSymbol);
    }
  };

  // Fetch data when component mounts or symbol/timeframe changes
  useEffect(() => {
    fetchStockData();
  }, [symbol, timeframe, fetchStockData]);
  
  // Set up auto-refresh interval
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        console.log("Auto-refreshing chart data");
        fetchStockData();
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchStockData]);

  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* Symbol search and current symbol */}
          <div className="flex flex-col w-full md:w-auto gap-2">
            <div className="w-full md:w-64">
              <StockSelector
                value={symbol}
                onChange={handleSelectStock}
                placeholder="Search stocks..."
              />
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {symbol}
              <span className={`text-lg font-normal ${priceInfo.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${priceInfo.current.toFixed(2)}
              </span>
              <span className={`text-sm font-normal ${priceInfo.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceInfo.change >= 0 ? '+' : ''}{priceInfo.change.toFixed(2)} ({priceInfo.changePercent.toFixed(2)}%)
              </span>
            </h2>
          </div>
          
          {/* Timeframe selector and refresh controls */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="flex gap-1">
              {TIMEFRAMES.map(tf => (
                <Button 
                  key={tf.value} 
                  variant={timeframe === tf.value ? "default" : "outline"}
                  size="sm"
                  className={`${timeframe === tf.value ? 'bg-teal-600 hover:bg-teal-700' : 'border-gray-700'}`}
                  onClick={() => setTimeframe(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                  className="rounded border-gray-700 bg-gray-900"
                />
                <label htmlFor="auto-refresh" className="text-sm text-gray-300">
                  Auto-refresh (1m)
                </label>
              </div>
              <Button 
                size="sm"
                variant="outline" 
                className="border-gray-700"
                onClick={fetchStockData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only md:not-sr-only md:inline-block">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Chart area */}
        <div className="h-[400px]">
          <StockChart 
            data={chartData} 
            symbols={[symbol]} 
            isLoading={isLoading} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChartPanel;
