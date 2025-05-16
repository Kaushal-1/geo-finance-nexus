
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  ChartData,
  TimeScale,
  ChartType,
  ChartOptions,
  ChartTypeRegistry
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { createChartOptions, darkThemeColors } from "./chart-utils/chartConfig";
import { CandlestickController, CandlestickElement, CandlestickChartType } from "./chart-utils/candlestickPlugin";
import { CandlestickData, calculateSMA, calculateEMA, calculateRSI, calculateMACD } from "./chart-utils/indicatorUtils";
import { formatCandlestickData, generateVolumeColors } from "./chart-utils/dataTransformer";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  CandlestickController,
  CandlestickElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Bar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

interface StockChartProps {
  data: {
    [symbol: string]: Bar[];
  };
  symbols: string[];
  isLoading?: boolean;
}

interface ChartConfig {
  showVolume: boolean;
  showSMA: boolean;
  showEMA: boolean;
  chartType: 'candlestick' | 'line';
  smaPeriod: number;
  emaPeriod: number;
}

// Define a more flexible chart data type
type StockChartData = ChartData<"line" | CandlestickChartType, any[]>;

const StockChart: React.FC<StockChartProps> = ({ data, symbols, isLoading }) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    showVolume: true,
    showSMA: true,
    showEMA: false,
    chartType: 'candlestick',
    smaPeriod: 20,
    emaPeriod: 50,
  });
  
  // Use a generic ref that will work with any chart type
  const chartRef = useRef<any>(null);
  
  // Prepare the chart data
  const chartData = useMemo(() => {
    if (isLoading || !data || symbols.length === 0) return null;

    // Get data for the first symbol
    const symbolData = data[symbols[0]] as CandlestickData[];
    if (!symbolData || symbolData.length === 0) return null;
    
    // Format the candlestick data
    const formattedData = formatCandlestickData(symbolData);
    const { timestamps, candlesticks, volumes, prices } = formattedData;
    
    // Calculate technical indicators
    const smaData = chartConfig.showSMA ? calculateSMA(symbolData, chartConfig.smaPeriod) : [];
    const emaData = chartConfig.showEMA ? calculateEMA(symbolData, chartConfig.emaPeriod) : [];
    
    // Generate volume colors based on price movement
    const volumeColors = generateVolumeColors(symbolData);
    
    // Create the datasets array
    const datasets: any[] = [];
    
    // Add the price dataset based on chart type
    if (chartConfig.chartType === 'candlestick') {
      datasets.push({
        type: 'candlestick',
        label: `${symbols[0]} Price`,
        data: candlesticks,
        candlestickWidth: 6,
        borderColorUp: darkThemeColors.green.base,
        borderColorDown: darkThemeColors.red.base,
        backgroundColorUp: 'rgba(34, 197, 94, 0.1)',
        backgroundColorDown: 'rgba(239, 68, 68, 0.1)',
        order: 0,
        yAxisID: 'y',
      });
    } else {
      datasets.push({
        type: 'line',
        label: `${symbols[0]} Price`,
        data: prices,
        borderColor: darkThemeColors.blue.base,
        backgroundColor: darkThemeColors.blue.gradient.start,
        fill: false,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
        order: 0
      });
    }
    
    // Add SMA indicator if enabled
    if (chartConfig.showSMA) {
      datasets.push({
        type: 'line',
        label: `SMA (${chartConfig.smaPeriod})`,
        data: smaData,
        borderColor: darkThemeColors.amber.base,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 3,
        yAxisID: 'y',
        order: 1
      });
    }
    
    // Add EMA indicator if enabled
    if (chartConfig.showEMA) {
      datasets.push({
        type: 'line',
        label: `EMA (${chartConfig.emaPeriod})`,
        data: emaData,
        borderColor: darkThemeColors.purple.base,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [2, 4],
        pointRadius: 0,
        pointHoverRadius: 3,
        yAxisID: 'y',
        order: 2
      });
    }
    
    // Add volume chart if enabled
    if (chartConfig.showVolume) {
      datasets.push({
        type: 'bar',
        label: 'Volume',
        data: volumes,
        backgroundColor: volumeColors,
        borderColor: 'transparent',
        borderWidth: 0,
        barThickness: 6,
        maxBarThickness: 10,
        yAxisID: 'y1',
        order: 3
      });
    }
    
    return {
      labels: timestamps,
      datasets
    } as StockChartData;
  }, [data, symbols, isLoading, chartConfig]);

  // Create chart options
  const options = useMemo(() => {
    return createChartOptions(chartConfig.showVolume);
  }, [chartConfig.showVolume]);

  // Toggle chart controls
  const toggleSMA = () => {
    setChartConfig(prev => ({ ...prev, showSMA: !prev.showSMA }));
  };
  
  const toggleEMA = () => {
    setChartConfig(prev => ({ ...prev, showEMA: !prev.showEMA }));
  };
  
  const toggleVolume = () => {
    setChartConfig(prev => ({ ...prev, showVolume: !prev.showVolume }));
  };
  
  const toggleChartType = () => {
    setChartConfig(prev => ({
      ...prev,
      chartType: prev.chartType === 'candlestick' ? 'line' : 'candlestick'
    }));
  };
  
  const increaseSMAPeriod = () => {
    setChartConfig(prev => ({ ...prev, smaPeriod: prev.smaPeriod + 5 }));
  };
  
  const decreaseSMAPeriod = () => {
    setChartConfig(prev => ({ 
      ...prev, 
      smaPeriod: Math.max(5, prev.smaPeriod - 5) 
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="h-full w-full bg-gray-800" />
      </div>
    );
  }

  if (!chartData || symbols.length === 0 || symbols.every(symbol => !data[symbol] || data[symbol].length === 0)) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20 rounded-lg border border-gray-800">
        <div className="text-xl text-gray-400">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 mb-3">
        <Button 
          size="sm" 
          variant={chartConfig.chartType === 'candlestick' ? "default" : "outline"} 
          className="text-xs h-7 px-2 py-1"
          onClick={toggleChartType}
        >
          Candlestick
        </Button>
        <Button 
          size="sm" 
          variant={chartConfig.chartType === 'line' ? "default" : "outline"} 
          className="text-xs h-7 px-2 py-1"
          onClick={toggleChartType}
        >
          Line
        </Button>
        <Button 
          size="sm" 
          variant={chartConfig.showSMA ? "default" : "outline"}
          className="text-xs h-7 px-2 py-1" 
          onClick={toggleSMA}
        >
          SMA {chartConfig.smaPeriod}
        </Button>
        {chartConfig.showSMA && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2 py-1"
              onClick={decreaseSMAPeriod}
            >
              -
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2 py-1"
              onClick={increaseSMAPeriod}
            >
              +
            </Button>
          </>
        )}
        <Button 
          size="sm" 
          variant={chartConfig.showEMA ? "default" : "outline"}
          className="text-xs h-7 px-2 py-1" 
          onClick={toggleEMA}
        >
          EMA {chartConfig.emaPeriod}
        </Button>
        <Button 
          size="sm" 
          variant={chartConfig.showVolume ? "default" : "outline"}
          className="text-xs h-7 px-2 py-1" 
          onClick={toggleVolume}
        >
          Volume
        </Button>
      </div>
      
      <div className="flex-1 relative">
        {/* Use any typing for the chart to avoid TypeScript errors */}
        {chartData && <Line 
          data={chartData as any} 
          options={options as any} 
          ref={chartRef as any} 
        />}
      </div>
    </div>
  );
};

export default StockChart;
