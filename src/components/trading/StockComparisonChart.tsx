
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { alpacaService } from "@/services/alpacaService";
import StockChart from "./StockChart";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface StockComparisonChartProps {
  symbols: string[]; // Updated to accept multiple symbols
  timeframe?: string;
}

// Define the Bar interface here if it's not properly exported from alpaca types
interface Bar {
  t: string;     // timestamp
  o: number;     // open
  h: number;     // high
  l: number;     // low
  c: number;     // close
  v: number;     // volume
}

interface ChartData {
  [symbol: string]: Bar[];
}

const StockComparisonChart: React.FC<StockComparisonChartProps> = ({ 
  symbols,
  timeframe = "1Day"
}) => {
  const [chartData, setChartData] = useState<ChartData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbols || symbols.length === 0) {
        console.log("No symbols provided to StockComparisonChart");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching chart data for symbols: ${symbols.join(', ')} with timeframe ${activeTimeframe}`);
        
        // Set appropriate limit based on timeframe
        let limit = 60; // Default
        if (activeTimeframe === "1Week") limit = 7 * 24; // 7 days of hourly bars
        if (activeTimeframe === "1Month") limit = 30; // 30 daily bars
        if (activeTimeframe === "1Year") limit = 365; // 365 daily bars
        
        // Create a new data object
        const newData: ChartData = {};
        
        // Fetch data for each symbol
        await Promise.all(symbols.map(async (symbol) => {
          try {
            console.log(`Fetching bars for ${symbol}`);
            const data = await alpacaService.getBars(symbol, activeTimeframe, limit);
            
            if (data && Array.isArray(data)) {
              console.log(`Received ${data.length} bars for ${symbol}`);
              // Ensure bars are sorted by time
              const sortedData = [...data].sort((a, b) => 
                new Date(a.t).getTime() - new Date(b.t).getTime()
              );
              
              newData[symbol] = sortedData;
            } else {
              console.warn(`No data received for ${symbol}`);
            }
          } catch (symbolError) {
            console.error(`Error fetching data for ${symbol}:`, symbolError);
            // Don't fail the entire chart for one symbol's error
            newData[symbol] = [];
          }
        }));
        
        setChartData(newData);
        
        // Check if we got any data
        const hasAnyData = Object.values(newData).some(bars => bars && bars.length > 0);
        if (!hasAnyData) {
          console.warn("No data was loaded for any symbols");
          setError("No chart data could be loaded. Please try again later.");
        }
      } catch (error) {
        console.error(`Failed to fetch chart data:`, error);
        setError("Failed to load chart data. Please try again.");
        toast({
          title: "Chart Error",
          description: "Failed to load chart data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (symbols.length > 0) {
      fetchChartData();
    }
  }, [symbols, activeTimeframe]);
  
  const handleTimeframeChange = (newTimeframe: string) => {
    console.log(`Changing timeframe to ${newTimeframe}`);
    setActiveTimeframe(newTimeframe);
  };
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="mb-4 flex justify-center">
          <div className="flex space-x-2">
            {["1Day", "1Week", "1Month", "1Year"].map((period) => (
              <Button
                key={period}
                variant={activeTimeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange(period)}
                className={activeTimeframe === period ? "bg-teal-600 hover:bg-teal-700" : "border-gray-700"}
              >
                {period.replace(/([A-Z])/g, ' $1').trim()}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-[400px]">
          {isLoading ? (
            <Skeleton className="h-full w-full bg-gray-800" />
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-gray-800/30 border border-gray-700 rounded-lg">
              <div className="text-center p-6">
                <p className="text-red-400 mb-3">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleTimeframeChange(activeTimeframe)}
                  className="border-gray-600"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <StockChart 
              data={chartData}
              symbols={symbols} 
              isLoading={isLoading} 
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StockComparisonChart;
