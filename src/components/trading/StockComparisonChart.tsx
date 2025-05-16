
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar } from "@/types/alpaca";
import { alpacaService } from "@/services/alpacaService";
import StockChart from "./StockChart";

interface StockComparisonChartProps {
  symbol: string;
  timeframe?: string;
}

const StockComparisonChart: React.FC<StockComparisonChartProps> = ({ 
  symbol,
  timeframe = "1Day"
}) => {
  const [chartData, setChartData] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
  }, [symbol, timeframe]);
  
  return (
    <div className="h-[300px]">
      {isLoading ? (
        <Skeleton className="h-full w-full bg-gray-800" />
      ) : (
        <StockChart 
          data={chartData} 
          symbol={symbol} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default StockComparisonChart;
