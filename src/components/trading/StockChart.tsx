
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
  ChartTypeRegistry,
  Plugin
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CandlestickController, CandlestickElement, CandlestickChartType } from "./chart-utils/candlestickPlugin";
import { CandlestickData, calculateSMA, calculateEMA, calculateRSI, calculateMACD } from "./chart-utils/indicatorUtils";
import { formatCandlestickData, generateVolumeColors } from "./chart-utils/dataTransformer";
import { createEnhancedChartOptions, enhancedChartColors } from "./chart-utils/enhancedChartConfig";
import { registerCustomPlugins, crosshairPlugin, priceAxisPlugin } from "./chart-utils/chartPlugins";
import { calculateBollingerBands, calculateVWAP, calculateATR, calculateIchimokuCloud } from "./chart-utils/enhancedIndicators";
import { BarChart2, TrendingUp, Layers, LineChart, CandlestickChart, Activity, 
  Move, ZoomIn, PanelTopOpen, PlusCircle, MinusCircle } from "lucide-react";
import { alpacaService } from "@/services/alpacaService";

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

// Register custom plugins
registerCustomPlugins();

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
  showBollingerBands: boolean;
  showVWAP: boolean;
  chartType: 'candlestick' | 'line' | 'area';
  smaPeriod: number;
  emaPeriod: number;
  bollingerPeriod: number;
  bollingerStdDev: number;
  zoomEnabled: boolean;
  showGridLines: boolean;
  theme: 'dark' | 'light';
  activeTab: 'main' | 'indicators' | 'settings';
}

// Define a more flexible chart data type
type StockChartData = ChartData<"line" | CandlestickChartType, any[]>;

const StockChart: React.FC<StockChartProps> = ({ data, symbols, isLoading }) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    showVolume: true,
    showSMA: true,
    showEMA: false,
    showBollingerBands: false,
    showVWAP: false,
    chartType: 'candlestick',
    smaPeriod: 20,
    emaPeriod: 50,
    bollingerPeriod: 20,
    bollingerStdDev: 2,
    zoomEnabled: true,
    showGridLines: true,
    theme: 'dark',
    activeTab: 'main',
  });
  
  // Use a generic ref that will work with any chart type
  const chartRef = useRef<any>(null);
  
  // Add a few helper functions for chart interaction
  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const zoomIn = () => {
    if (chartRef.current && chartRef.current.zoom) {
      chartRef.current.zoom(1.1);
    }
  };

  const zoomOut = () => {
    if (chartRef.current && chartRef.current.zoom) {
      chartRef.current.zoom(0.9);
    }
  };
  
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
    
    // Calculate Bollinger Bands
    let bollingerBands = { middle: [], upper: [], lower: [] };
    if (chartConfig.showBollingerBands) {
      bollingerBands = calculateBollingerBands(
        symbolData, 
        chartConfig.bollingerPeriod, 
        chartConfig.bollingerStdDev
      );
    }
    
    // Calculate VWAP
    const vwapData = chartConfig.showVWAP ? calculateVWAP(symbolData) : [];
    
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
        borderColorUp: enhancedChartColors.green.base,
        borderColorDown: enhancedChartColors.red.base,
        backgroundColorUp: 'rgba(38, 166, 154, 0.1)',
        backgroundColorDown: 'rgba(239, 83, 80, 0.1)',
        order: 0,
        yAxisID: 'y',
      });
    } else if (chartConfig.chartType === 'area') {
      datasets.push({
        type: 'line',
        label: `${symbols[0]} Price`,
        data: prices,
        borderColor: enhancedChartColors.blue.base,
        backgroundColor: enhancedChartColors.blue.gradient.start,
        fill: true,
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
        order: 0
      });
    } else {
      datasets.push({
        type: 'line',
        label: `${symbols[0]} Price`,
        data: prices,
        borderColor: enhancedChartColors.blue.base,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
        order: 0
      });
    }
    
    // Add Bollinger Bands if enabled
    if (chartConfig.showBollingerBands) {
      // Middle band
      datasets.push({
        type: 'line',
        label: `Bollinger Middle (${chartConfig.bollingerPeriod})`,
        data: bollingerBands.middle,
        borderColor: enhancedChartColors.purple.base,
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        order: 2
      });
      
      // Upper band
      datasets.push({
        type: 'line',
        label: `Bollinger Upper (${chartConfig.bollingerStdDev}σ)`,
        data: bollingerBands.upper,
        borderColor: enhancedChartColors.purple.light,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        order: 2
      });
      
      // Lower band
      datasets.push({
        type: 'line',
        label: `Bollinger Lower (${chartConfig.bollingerStdDev}σ)`,
        data: bollingerBands.lower,
        borderColor: enhancedChartColors.purple.light,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        order: 2
      });
      
      // Fill between upper and lower bands
      datasets.push({
        type: 'line',
        label: 'Bollinger Band Area',
        data: bollingerBands.upper,
        borderColor: 'transparent',
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: '+2', // Fill to the dataset 2 positions ahead
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        yAxisID: 'y',
        order: 3
      });
    }
    
    // Add VWAP indicator if enabled
    if (chartConfig.showVWAP) {
      datasets.push({
        type: 'line',
        label: 'VWAP',
        data: vwapData,
        borderColor: enhancedChartColors.amber.base,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: 'y',
        order: 1
      });
    }
    
    // Add SMA indicator if enabled
    if (chartConfig.showSMA) {
      datasets.push({
        type: 'line',
        label: `SMA (${chartConfig.smaPeriod})`,
        data: smaData,
        borderColor: enhancedChartColors.amber.base,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [0],
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
        borderColor: enhancedChartColors.purple.base,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [3, 3],
        pointRadius: 0,
        pointHoverRadius: 3,
        yAxisID: 'y',
        order: 1
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
        order: 4
      });
    }
    
    return {
      labels: timestamps,
      datasets
    } as StockChartData;
  }, [data, symbols, isLoading, chartConfig]);

  // Create enhanced chart options
  const options = useMemo(() => {
    const enhancedOptions = createEnhancedChartOptions(chartConfig.showVolume);
    
    // Add zoom plugin options if zoom is enabled
    if (chartConfig.zoomEnabled) {
      (enhancedOptions.plugins as any).zoom = {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        }
      };
    }
    
    return enhancedOptions;
  }, [chartConfig.showVolume, chartConfig.zoomEnabled]);

  // Toggle chart controls
  const toggleSMA = () => {
    setChartConfig(prev => ({ ...prev, showSMA: !prev.showSMA }));
  };
  
  const toggleEMA = () => {
    setChartConfig(prev => ({ ...prev, showEMA: !prev.showEMA }));
  };
  
  const toggleBollingerBands = () => {
    setChartConfig(prev => ({ ...prev, showBollingerBands: !prev.showBollingerBands }));
  };
  
  const toggleVWAP = () => {
    setChartConfig(prev => ({ ...prev, showVWAP: !prev.showVWAP }));
  };
  
  const toggleVolume = () => {
    setChartConfig(prev => ({ ...prev, showVolume: !prev.showVolume }));
  };
  
  const toggleChartType = (type: 'candlestick' | 'line' | 'area') => {
    setChartConfig(prev => ({ ...prev, chartType: type }));
  };
  
  const toggleZoom = () => {
    setChartConfig(prev => ({ ...prev, zoomEnabled: !prev.zoomEnabled }));
  };
  
  const setActiveTab = (tab: 'main' | 'indicators' | 'settings') => {
    setChartConfig(prev => ({ ...prev, activeTab: tab }));
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
  
  const increaseEMAPeriod = () => {
    setChartConfig(prev => ({ ...prev, emaPeriod: prev.emaPeriod + 5 }));
  };
  
  const decreaseEMAPeriod = () => {
    setChartConfig(prev => ({
      ...prev,
      emaPeriod: Math.max(5, prev.emaPeriod - 5)
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
      <div className="flex flex-wrap gap-2 mb-3 bg-gray-900/40 p-2 rounded-md">
        {/* Chart type buttons */}
        <div className="flex items-center bg-gray-800/50 rounded-md border border-gray-700/50">
          <Button 
            size="sm" 
            variant={chartConfig.chartType === 'candlestick' ? "default" : "ghost"} 
            className="text-xs h-7 px-2 py-1"
            onClick={() => toggleChartType('candlestick')}
            title="Candlestick Chart"
          >
            <CandlestickChart size={14} className="mr-1" />
            <span className="hidden sm:inline">Candle</span>
          </Button>
          <Button 
            size="sm" 
            variant={chartConfig.chartType === 'line' ? "default" : "ghost"} 
            className="text-xs h-7 px-2 py-1"
            onClick={() => toggleChartType('line')}
            title="Line Chart"
          >
            <LineChart size={14} className="mr-1" />
            <span className="hidden sm:inline">Line</span>
          </Button>
          <Button 
            size="sm" 
            variant={chartConfig.chartType === 'area' ? "default" : "ghost"} 
            className="text-xs h-7 px-2 py-1"
            onClick={() => toggleChartType('area')}
            title="Area Chart"
          >
            <BarChart2 size={14} className="mr-1" />
            <span className="hidden sm:inline">Area</span>
          </Button>
        </div>
        
        {/* Indicators buttons */}
        <div className="flex items-center flex-wrap gap-1 ml-1">
          <Button 
            size="sm" 
            variant={chartConfig.showSMA ? "default" : "outline"}
            className="text-xs h-7 px-2 py-1" 
            onClick={toggleSMA}
          >
            <TrendingUp size={14} className="mr-1" />
            <span>MA {chartConfig.smaPeriod}</span>
          </Button>
          
          {chartConfig.showSMA && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7 px-2 py-1 border-gray-700"
                onClick={decreaseSMAPeriod}
                title="Decrease period"
              >
                <MinusCircle size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7 px-2 py-1 border-gray-700"
                onClick={increaseSMAPeriod}
                title="Increase period"
              >
                <PlusCircle size={14} />
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            variant={chartConfig.showEMA ? "default" : "outline"}
            className="text-xs h-7 px-2 py-1" 
            onClick={toggleEMA}
          >
            <Activity size={14} className="mr-1" />
            <span>EMA {chartConfig.emaPeriod}</span>
          </Button>
          
          <Button 
            size="sm" 
            variant={chartConfig.showBollingerBands ? "default" : "outline"}
            className="text-xs h-7 px-2 py-1" 
            onClick={toggleBollingerBands}
            title="Bollinger Bands"
          >
            <Layers size={14} className="mr-1" />
            <span className="hidden sm:inline">Bands</span>
          </Button>
          
          <Button 
            size="sm" 
            variant={chartConfig.showVWAP ? "default" : "outline"}
            className="text-xs h-7 px-2 py-1" 
            onClick={toggleVWAP}
            title="Volume Weighted Average Price"
          >
            <Activity size={14} className="mr-1" />
            <span className="hidden sm:inline">VWAP</span>
          </Button>
          
          <Button 
            size="sm" 
            variant={chartConfig.showVolume ? "default" : "outline"}
            className="text-xs h-7 px-2 py-1" 
            onClick={toggleVolume}
            title="Volume"
          >
            <BarChart2 size={14} className="mr-1" />
            <span className="hidden sm:inline">Vol</span>
          </Button>
        </div>
        
        {/* Chart controls */}
        <div className="flex gap-1 ml-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-7 px-2 py-1 border-gray-700"
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-7 px-2 py-1 border-gray-700"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomIn size={14} style={{ transform: 'scale(-1, 1)' }} />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-7 px-2 py-1 border-gray-700"
            onClick={resetZoom}
            title="Reset Zoom"
          >
            <Move size={14} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-gray-900/20 border border-gray-800/50 rounded-md">
        {/* Use any typing for the chart to avoid TypeScript errors */}
        {chartData && <Line 
          data={chartData as any} 
          options={options as any} 
          ref={chartRef as any} 
          plugins={[crosshairPlugin, priceAxisPlugin] as Plugin<any>[]}
        />}
        
        {/* Chart legend overlay for mobile */}
        <div className="absolute bottom-2 left-2 z-10 bg-black/70 rounded-md p-1 hidden md:hidden">
          <div className="text-xs text-white font-mono">
            {symbols[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
