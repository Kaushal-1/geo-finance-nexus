
import React, { useMemo } from "react";
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
  ChartOptions,
  BarElement,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

// Define chart colors for different stocks
const CHART_COLORS = [
  { line: "#3b82f6", background: "rgba(59, 130, 246, 0.2)" }, // blue
  { line: "#f59e0b", background: "rgba(245, 158, 11, 0.2)" }, // amber
  { line: "#10b981", background: "rgba(16, 185, 129, 0.2)" }, // emerald
  { line: "#ef4444", background: "rgba(239, 68, 68, 0.2)" },  // red
];

// Types for mixed chart datasets
type LineDataset = {
  type: 'line';
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
  yAxisID: string;
  order: number;
}

type BarDataset = {
  type: 'bar';
  label: string;
  data: number[];
  backgroundColor: string[] | string;
  borderColor: string;
  borderWidth: number;
  barThickness: number;
  yAxisID: string;
  order: number;
}

type ChartDataset = LineDataset | BarDataset;
type StockChartData = ChartData<'line', number[], string> & {
  datasets: ChartDataset[];
};

const StockChart: React.FC<StockChartProps> = ({ data, symbols, isLoading }) => {
  // Prepare the chart data
  const chartData = useMemo(() => {
    if (isLoading || !data || symbols.length === 0) return null;

    // Get data for the first symbol
    const symbolData = data[symbols[0]];
    if (!symbolData || symbolData.length === 0) return null;
    
    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).toLowerCase();
    };

    const labels = symbolData.map(bar => formatDate(bar.t));
    
    // Prepare the datasets
    const datasets: ChartDataset[] = [];
    
    // Price dataset
    const priceData = symbolData.map(bar => bar.c);
    
    // Calculate price change for label
    const firstPrice = symbolData[0]?.c || 0;
    const lastPrice = symbolData[symbolData.length - 1]?.c || 0;
    const priceChange = lastPrice - firstPrice;
    const percentChange = (priceChange / firstPrice) * 100;
    
    datasets.push({
      type: 'line' as const,
      label: `${symbols[0]} (${priceChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)`,
      data: priceData,
      borderColor: '#3b82f6', // Blue line
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: false,
      tension: 0.2,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      yAxisID: 'y',
      order: 0
    });
    
    // Volume dataset
    const volumeData = symbolData.map(bar => bar.v);
    
    // Create color array based on price changes
    const volumeColors = symbolData.map((bar, index) => {
      // For the first bar or when the close is higher than previous close
      if (index === 0 || bar.c >= symbolData[index - 1].c) {
        return 'rgba(15, 206, 157, 0.6)'; // Green
      }
      // When the close is lower than the previous close
      return 'rgba(239, 68, 68, 0.6)'; // Red
    });
    
    datasets.push({
      type: 'bar' as const,
      label: 'Volume',
      data: volumeData,
      backgroundColor: volumeColors,
      borderColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 0,
      barThickness: 8, // Increased bar thickness
      yAxisID: 'y1',
      order: 1
    });
    
    return {
      labels,
      datasets
    } as StockChartData;
  }, [data, symbols, isLoading]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(13, 17, 23, 0.9)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 600 // Fix: using number instead of string
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (context.dataset.yAxisID === 'y1') {
              // Format volume with commas
              return `${datasetLabel}: ${value.toLocaleString()}`;
            }
            
            // Format price with precision
            return `${datasetLabel}: $${value.toFixed(2)}`;
          }
        }
      },
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          color: '#e5e7eb', // text-gray-200
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'line',
          padding: 15
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      },
      y: {
        position: 'right',
        grid: {
          color: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: (value) => {
            // Ensure value is treated as a number for toFixed
            const numValue = Number(value);
            return `$${numValue.toFixed(2)}`;
          }
        },
        title: {
          display: false
        }
      },
      y1: {
        position: 'left',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: (value) => {
            // Ensure value is treated as a number for calculations
            const numValue = Number(value);
            if (numValue >= 1000000) {
              return `${(numValue / 1000000).toFixed(1)}M`;
            } else if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(1)}K`;
            }
            return value;
          }
        },
        title: {
          display: false
        }
      }
    }
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
    <div className="h-[450px] relative"> {/* Increased height for better visualization */}
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;
