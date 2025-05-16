
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

interface Bar {
  t: string; // timestamp
  o: number; // open
  h: number; // low
  l: number; // high
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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [priceInfo, setPriceInfo] = useState({ 
    current: 0, 
    change: 0, 
    changePercent: 0,
    high: 0,
    low: 0,
    open: 0,
    volume: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
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
        
        // Calculate price info
        if (sortedData.length > 0) {
          const latestBar = sortedData[sortedData.length - 1];
          const firstBar = sortedData[0];
          const priceChange = latestBar.c - firstBar.c;
          const priceChangePercent = (priceChange / firstBar.c) * 100;
          
          // Get the highest high and lowest low across all bars
          const highestHigh = Math.max(...sortedData.map(bar => bar.h));
          const lowestLow = Math.min(...sortedData.map(bar => bar.l));
          
          setPriceInfo({
            current: latestBar.c,
            change: priceChange,
            changePercent: priceChangePercent,
            high: highestHigh,
            low: lowestLow,
            open: firstBar.o,
            volume: latestBar.v
          });
        }
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
  }, [symbol, timeframe]);
  
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
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Format volume for display
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`;
    }
    return volume.toString();
  };
  
  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

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
                {priceInfo.current > 0 && (
                  <span className={`text-sm font-normal ${priceInfo.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${formatNumber(priceInfo.current)}
                  </span>
                )}
              </h2>
              
              {priceInfo.change !== 0 && (
                <div className="flex items-center space-x-2">
                  <span className={`flex items-center ${priceInfo.change >= 0 ? 'text-green-500' : 'text-red-500'} text-sm`}>
                    {priceInfo.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {priceInfo.change >= 0 ? '+' : ''}{formatNumber(priceInfo.change)} ({priceInfo.changePercent >= 0 ? '+' : ''}{formatNumber(priceInfo.changePercent)}%)
                  </span>
                </div>
              )}
            </div>
            
            {/* Price stats */}
            {!isLoading && priceInfo.current > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                <div>Open: <span className="text-gray-300">${formatNumber(priceInfo.open)}</span></div>
                <div>High: <span className="text-gray-300">${formatNumber(priceInfo.high)}</span></div>
                <div>Low: <span className="text-gray-300">${formatNumber(priceInfo.low)}</span></div>
                <div>Vol: <span className="text-gray-300">{formatVolume(priceInfo.volume)}</span></div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChartPanel;
