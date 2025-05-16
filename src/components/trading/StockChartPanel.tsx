
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import StockChart from "./StockChart";
import { alpacaService } from "@/services/alpacaService";

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
  { value: "1Day", label: "1D" },
  { value: "5Day", label: "5D" },
  { value: "1Week", label: "1W" },
  { value: "1Month", label: "1M" }
];

const StockChartPanel: React.FC<StockChartPanelProps> = ({ onSymbolChange }) => {
  const [symbol, setSymbol] = useState("AAPL"); // Default symbol
  const [chartData, setChartData] = useState<Bar[]>([]);
  const [timeframe, setTimeframe] = useState("1Day");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [showResults, setShowResults] = useState(false);
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
        
        setChartData(sortedData);
        
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
      interval = setInterval(() => {
        console.log("Auto-refreshing chart data");
        fetchStockData();
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchStockData]);

  // Format data for the chart component
  const formattedChartData = {
    [symbol]: chartData
  };

  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
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
                    className="bg-gray-900 border-gray-700 pr-8"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 mt-1">
                      <ul className="bg-gray-900 border border-gray-700 rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                        {searchResults.map(result => (
                          <li 
                            key={result.id} 
                            className="p-2 hover:bg-gray-800 cursor-pointer text-sm"
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
                <Button type="submit" variant="outline" size="sm" className="border-gray-700">
                  Go
                </Button>
              </form>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {symbol}
              {priceInfo.current > 0 && (
                <span className={`text-sm font-normal ${priceInfo.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceInfo.change >= 0 ? '+' : ''}{priceInfo.change.toFixed(2)} ({priceInfo.changePercent.toFixed(2)}%)
                </span>
              )}
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
            
            <div className="flex gap-2">
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
        <StockChart 
          data={formattedChartData} 
          symbols={[symbol]} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
};

export default StockChartPanel;
