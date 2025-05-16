
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, ArrowUp, ArrowDown, Clock, Settings, ChevronRight, ChevronLeft, Maximize, Minimize, CandlestickChart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockChart from "./StockChart";
import { alpacaService } from "@/services/alpacaService";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealTimeMarketData } from "@/hooks/useRealTimeMarketData";

interface Bar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  class: string;
}

interface StockChartPanelProps {
  onSymbolChange?: (symbol: string) => void;
}

// Timeframe options
const TIMEFRAMES = [
  { value: "1Min", label: "1M", apiValue: "1Min", limit: 120 },
  { value: "5Min", label: "5M", apiValue: "5Min", limit: 120 },
  { value: "15Min", label: "15M", apiValue: "15Min", limit: 100 },
  { value: "1Hour", label: "1H", apiValue: "1Hour", limit: 72 },
  { value: "1Day", label: "1D", apiValue: "1Day", limit: 30 },
  { value: "1Week", label: "1W", apiValue: "1Week", limit: 52 },
  { value: "1Month", label: "1M", apiValue: "1Month", limit: 24 },
];

const StockChartPanel: React.FC<StockChartPanelProps> = ({ onSymbolChange }) => {
  const [symbol, setSymbol] = useState("AAPL"); // Default symbol
  const [chartData, setChartData] = useState<Bar[]>([]);
  const [timeframe, setTimeframe] = useState("15Min");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Use real-time market data hook
  const { marketData, isLoading: isLoadingRealTime, refetch: refetchRealTime } = useRealTimeMarketData(symbol);
  
  // Function to fetch stock data
  const fetchStockData = useCallback(async () => {
    console.log(`Fetching stock data for ${symbol} with timeframe ${timeframe}`);
    setIsLoading(true);
    try {
      // Get the appropriate limit based on timeframe
      const selectedTimeframe = TIMEFRAMES.find(tf => tf.value === timeframe) || TIMEFRAMES[2]; // default to 15Min
      const limit = selectedTimeframe.limit;
      
      const response = await alpacaService.getBars(symbol, selectedTimeframe.apiValue, limit);
      console.log("Stock data response:", response);
      
      if (response && Array.isArray(response)) {
        // Ensure bars are sorted by time
        const sortedData = [...response].sort((a, b) => 
          new Date(a.t).getTime() - new Date(b.t).getTime()
        );
        
        setChartData(sortedData);
        setLastUpdated(new Date());
        
        // Also refresh real-time data
        refetchRealTime();
      } else {
        console.error("Invalid response format:", response);
        setChartData([]);
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
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe, refetchRealTime]);
  
  // Function to search stocks
  const searchStocks = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    console.log(`Searching stocks with query: ${query}`);
    try {
      const response = await alpacaService.searchAssets(query);
      console.log("Search results:", response);
      if (response && Array.isArray(response)) {
        setSearchResults(response.slice(0, 10)); // Limit to 10 results
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search stocks:", error);
      setSearchResults([]);
    }
  }, []);
  
  // Function to handle stock selection
  const selectStock = (newSymbol: string) => {
    console.log(`Selecting stock: ${newSymbol}`);
    setSymbol(newSymbol);
    setSearchTerm("");
    setShowResults(false);
    
    // Call the onSymbolChange callback if provided
    if (onSymbolChange) {
      onSymbolChange(newSymbol);
    }
  };
  
  // Function to handle manual stock entry
  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      // Basic validation for stock symbol format
      const isValidSymbol = /^[A-Za-z]{1,5}$/.test(searchTerm);
      
      if (isValidSymbol) {
        selectStock(searchTerm.toUpperCase());
      } else {
        toast({
          title: "Invalid Symbol",
          description: "Please enter a valid stock symbol (1-5 letters)",
          duration: 3000
        });
      }
    }
  };
  
  // Format numbers for display
  const formatNumber = (num: number | null, decimals = 2) => {
    if (num === null) return '--';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Format volume for display
  const formatVolume = (volume: number | null) => {
    if (volume === null) return '--';
    if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`;
    }
    return volume.toString();
  };
  
  // Format last updated time
  const formatLastUpdated = () => {
    const timestamp = marketData.lastUpdated || lastUpdated;
    
    if (!timestamp) return "Never";
    
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Append real-time data to chart if it's a small timeframe (1m, 5m, 15m)
  useEffect(() => {
    if (!marketData.price || !marketData.lastUpdated || chartData.length === 0) {
      return;
    }
    
    // Only append real-time data for small timeframes
    if (!['1Min', '5Min', '15Min'].includes(timeframe)) {
      return;
    }
    
    // Check if this update is new enough to add to chart
    const lastBarTime = new Date(chartData[chartData.length - 1].t);
    const now = marketData.lastUpdated;
    let shouldAddBar = false;
    
    // Determine if we should add a new bar based on timeframe
    if (timeframe === '1Min') {
      shouldAddBar = now.getMinutes() !== lastBarTime.getMinutes() || 
                    now.getHours() !== lastBarTime.getHours() ||
                    now.getDate() !== lastBarTime.getDate();
    } else if (timeframe === '5Min') {
      shouldAddBar = Math.floor(now.getMinutes() / 5) !== Math.floor(lastBarTime.getMinutes() / 5) || 
                    now.getHours() !== lastBarTime.getHours() ||
                    now.getDate() !== lastBarTime.getDate();
    } else if (timeframe === '15Min') {
      shouldAddBar = Math.floor(now.getMinutes() / 15) !== Math.floor(lastBarTime.getMinutes() / 15) || 
                    now.getHours() !== lastBarTime.getHours() ||
                    now.getDate() !== lastBarTime.getDate();
    }
    
    if (shouldAddBar && marketData.price) {
      const lastBar = chartData[chartData.length - 1];
      const newBar = {
        t: now.toISOString(),
        o: lastBar.c, // Open is the last close
        h: marketData.price,
        l: marketData.price,
        c: marketData.price,
        v: marketData.volume || 0
      };
      
      setChartData(prevData => [...prevData, newBar]);
    } else if (marketData.price) {
      // Update the last bar with current price
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const updatedData = [...prevData];
        const lastIndex = updatedData.length - 1;
        const lastBar = updatedData[lastIndex];
        
        updatedData[lastIndex] = {
          ...lastBar,
          h: Math.max(lastBar.h, marketData.price!),
          l: Math.min(lastBar.l, marketData.price!),
          c: marketData.price!,
          v: marketData.volume || lastBar.v
        };
        
        return updatedData;
      });
    }
  }, [marketData, timeframe, chartData]);

  // Fetch data when component mounts or symbol/timeframe changes
  useEffect(() => {
    fetchStockData();
  }, [symbol, timeframe, fetchStockData]);
  
  // Handle search term changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchStocks(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, searchStocks]);
  
  // Set up auto-refresh interval
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (autoRefresh) {
      // Determine refresh interval based on timeframe
      let refreshInterval = 60000; // Default to 1 minute
      
      if (timeframe === '1Min') {
        refreshInterval = 30000; // 30 seconds for 1-minute charts
      } else if (['5Min', '15Min'].includes(timeframe)) {
        refreshInterval = 60000; // 1 minute for 5-minute and 15-minute charts
      } else if (timeframe === '1Hour') {
        refreshInterval = 300000; // 5 minutes for hourly charts
      } else {
        refreshInterval = 900000; // 15 minutes for daily+ charts
      }
      
      interval = setInterval(() => {
        console.log("Auto-refreshing chart data");
        fetchStockData();
      }, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, timeframe, fetchStockData]);

  // Format data for the chart component
  const formattedChartData = {
    [symbol]: chartData
  };
  
  // Determine if we should show live indicator
  const isLiveData = marketData.lastUpdated && 
    (new Date().getTime() - marketData.lastUpdated.getTime()) < 60000; // Within the last minute

  return (
    <Card className={`bg-black/20 border-gray-800 backdrop-blur-sm mb-6 ${expanded ? 'fixed inset-0 z-50 m-0 rounded-none overflow-auto' : ''}`}>
      <CardContent className={`p-4 ${expanded ? 'h-full flex flex-col' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* Symbol search and current symbol */}
          <div className="flex flex-col w-full md:w-auto gap-2">
            <div className="relative">
              <form onSubmit={handleManualEntry} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stocks..."
                    className="bg-gray-900 border-gray-700 pr-8 font-inter"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 mt-1">
                      <ul className="bg-gray-900 border border-gray-700 rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                        {searchResults.map(result => (
                          <li 
                            key={result.id} 
                            className="p-2 hover:bg-gray-800 cursor-pointer text-sm font-inter"
                            onClick={() => selectStock(result.symbol)}
                          >
                            <span className="font-bold text-teal-400">{result.symbol}</span>
                            <span className="ml-2 text-gray-300">{result.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button type="submit" variant="outline" size="sm" className="border-gray-700 font-inter">
                  Go
                </Button>
              </form>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-inter">
                <CandlestickChart className="h-5 w-5 text-teal-400" />
                {symbol}
                {marketData.price !== null && (
                  <span className={`text-sm font-normal ${marketData.change && marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${formatNumber(marketData.price)}
                    {isLiveData && (
                      <span className="ml-2 text-xs inline-flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                        LIVE
                      </span>
                    )}
                  </span>
                )}
              </h2>
              
              {marketData.change !== null && (
                <div className="flex items-center space-x-2">
                  <span className={`flex items-center ${marketData.change >= 0 ? 'text-green-500' : 'text-red-500'} text-sm`}>
                    {marketData.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {marketData.change >= 0 ? '+' : ''}{formatNumber(marketData.change)} ({marketData.changePercent && marketData.changePercent >= 0 ? '+' : ''}{formatNumber(marketData.changePercent)}%)
                  </span>
                </div>
              )}
            </div>
            
            {/* Price stats */}
            {!isLoadingRealTime && marketData.price !== null && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                <div>Open: <span className="text-gray-300">${formatNumber(marketData.prevClose)}</span></div>
                <div>High: <span className="text-gray-300">${formatNumber(marketData.high)}</span></div>
                <div>Low: <span className="text-gray-300">${formatNumber(marketData.low)}</span></div>
                <div>Vol: <span className="text-gray-300">{formatVolume(marketData.volume)}</span></div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatLastUpdated()}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Timeframe selector and refresh controls */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Tabs defaultValue={timeframe} className="w-full">
              <TabsList className="grid grid-cols-7">
                {TIMEFRAMES.map(tf => (
                  <TabsTrigger 
                    key={tf.value} 
                    value={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className="text-xs"
                  >
                    {tf.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-refresh"
                        checked={autoRefresh}
                        onChange={() => setAutoRefresh(!autoRefresh)}
                        className="rounded border-gray-700 bg-gray-900"
                      />
                      <label htmlFor="auto-refresh" className="text-sm text-gray-300 font-inter">
                        Auto
                      </label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Auto-refresh chart data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button 
                size="sm"
                variant="outline" 
                className="border-gray-700"
                onClick={fetchStockData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700"
                onClick={() => setExpanded(!expanded)}
                title={expanded ? "Exit fullscreen" : "View fullscreen"}
              >
                {expanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Chart area with increased height */}
        <div className={`${expanded ? 'flex-1' : 'h-[450px]'} mb-1 relative`}>
          <StockChart 
            data={formattedChartData} 
            symbols={[symbol]} 
            isLoading={isLoading} 
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
                <p className="text-sm text-gray-300">Loading {symbol} data...</p>
              </div>
            </div>
          )}
          
          {isLiveData && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1 px-2 rounded-md border border-green-500/30">
              <div className="flex items-center text-xs text-green-500 font-mono">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                LIVE DATA
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChartPanel;
