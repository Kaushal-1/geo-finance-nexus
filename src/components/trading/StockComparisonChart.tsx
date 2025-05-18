
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { alpacaService } from "@/services/alpacaService";
import StockChart from "./StockChart";

interface StockComparisonChartProps {
  symbol: string;
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

const StockComparisonChart: React.FC<StockComparisonChartProps> = ({ 
  symbol,
  timeframe = "1Day"
}) => {
  const [chartData, setChartData] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(Date.now()); // Add a key prop to force re-render when symbol changes
  
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Set appropriate limit based on timeframe
        let limit = 60; // Default
        if (timeframe === "1Week") limit = 7 * 24; // 7 days of hourly bars
        if (timeframe === "1Month") limit = 30; // 30 daily bars
        if (timeframe === "1Year") limit = 365; // 365 daily bars
        
        const data = await alpacaService.getBars(symbol, timeframe, limit);
        
        if (data && Array.isArray(data)) {
          // Ensure bars are sorted by time
          const sortedData = [...data].sort((a, b) => 
            new Date(a.t).getTime() - new Date(b.t).getTime()
          );
          
          setChartData(sortedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error(`Failed to fetch chart data for ${symbol}:`, error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChartData();
    // Change key when symbol or timeframe changes to force Chart.js to re-initialize
    setKey(Date.now());
  }, [symbol, timeframe]);
  
  return (
    <div className="h-[300px] relative">
      {isLoading ? (
        <Skeleton className="h-full w-full bg-gray-800/50" />
      ) : (
        <div className="h-full">
          <StockChart 
            key={`${symbol}-${timeframe}-${key}`} // Add unique key to force remount
            data={chartData} 
            symbol={symbol} 
            isLoading={isLoading} 
          />
        </div>
      )}
    </div>
  );
};

export default StockComparisonChart;
