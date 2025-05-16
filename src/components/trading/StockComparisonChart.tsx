
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { alpacaService } from "@/services/alpacaService";
import StockChart from "./StockChart";
import { Button } from "@/components/ui/button";

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
  
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Set appropriate limit based on timeframe
        let limit = 60; // Default
        if (activeTimeframe === "1Week") limit = 7 * 24; // 7 days of hourly bars
        if (activeTimeframe === "1Month") limit = 30; // 30 daily bars
        if (activeTimeframe === "1Year") limit = 365; // 365 daily bars
        
        // Create a new data object
        const newData: ChartData = {};
        
        // Fetch data for each symbol
        await Promise.all(symbols.map(async (symbol) => {
          const data = await alpacaService.getBars(symbol, activeTimeframe, limit);
          
          if (data && Array.isArray(data)) {
            // Ensure bars are sorted by time
            const sortedData = [...data].sort((a, b) => 
              new Date(a.t).getTime() - new Date(b.t).getTime()
            );
            
            newData[symbol] = sortedData;
          }
        }));
        
        setChartData(newData);
      } catch (error) {
        console.error(`Failed to fetch chart data:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (symbols.length > 0) {
      fetchChartData();
    }
  }, [symbols, activeTimeframe]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex justify-center">
        <div className="flex space-x-2">
          {["1Day", "1Week", "1Month", "1Year"].map((period) => (
            <Button
              key={period}
              variant={activeTimeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTimeframe(period)}
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
        ) : (
          <StockChart 
            data={chartData}
            symbols={symbols} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default StockComparisonChart;
