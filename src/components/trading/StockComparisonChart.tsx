
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { alpacaService } from "@/services/alpacaService";
import StockChart from "./StockChart";

interface StockComparisonChartProps {
  symbols: string[];
  timeframe?: string;
  multiChart?: boolean;
}

// Define the Bar interface here if it's not properly exported from alpaca types
interface Bar {
  t: string;     // timestamp
  o: number;     // open
  h: number;     // high
  l: number;     // low
  c: number;     // close
  v: number;     // volume
  symbol?: string; // symbol identifier for multi-chart
}

const StockComparisonChart: React.FC<StockComparisonChartProps> = ({ 
  symbols = ["AAPL"],
  timeframe = "1Day",
  multiChart = false
}) => {
  const [chartData, setChartData] = useState<{[symbol: string]: Bar[]}>({});
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
        
        const fetchPromises = symbols.map(symbol => 
          alpacaService.getBars(symbol, timeframe, limit)
            .then(data => ({ symbol, data }))
        );
        
        const results = await Promise.all(fetchPromises);
        
        const dataBySymbol: {[symbol: string]: Bar[]} = {};
        results.forEach(({ symbol, data }) => {
          if (data && Array.isArray(data)) {
            // Ensure bars are sorted by time and add symbol property
            const sortedData = [...data]
              .sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())
              .map(bar => ({ ...bar, symbol }));
            
            dataBySymbol[symbol] = sortedData;
          } else {
            dataBySymbol[symbol] = [];
          }
        });
        
        setChartData(dataBySymbol);
      } catch (error) {
        console.error(`Failed to fetch chart data:`, error);
        setChartData({});
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChartData();
    // Change key when symbols or timeframe changes to force Chart.js to re-initialize
    setKey(Date.now());
  }, [symbols.join(","), timeframe]);
  
  // For single chart, render one chart with both datasets
  if (multiChart) {
    return (
      <div className="h-[300px]">
        {isLoading ? (
          <Skeleton className="h-full w-full bg-gray-800" />
        ) : (
          <StockChart 
            key={`multi-${symbols.join("-")}-${timeframe}-${key}`}
            data={chartData} 
            symbols={symbols}
            isLoading={isLoading}
            multiStock={true}
          />
        )}
      </div>
    );
  }
  
  // For compatibility with existing code, render individual charts
  return (
    <div className="h-[300px]">
      {isLoading ? (
        <Skeleton className="h-full w-full bg-gray-800" />
      ) : (
        symbols.length > 0 && (
          <StockChart 
            key={`${symbols[0]}-${timeframe}-${key}`}
            data={chartData[symbols[0]] || []}
            symbol={symbols[0]}
            isLoading={isLoading}
            multiStock={false}
          />
        )
      )}
    </div>
  );
};

export default StockComparisonChart;
