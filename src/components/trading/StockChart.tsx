
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
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

const StockChart: React.FC<StockChartProps> = ({ data, symbols, isLoading }) => {
  // Prepare the chart data
  const chartData = useMemo(() => {
    if (isLoading || !data || symbols.length === 0) return null;

    // Find common dates across all symbols
    const allDates = new Set<string>();
    symbols.forEach(symbol => {
      if (data[symbol]) {
        data[symbol].forEach(bar => allDates.add(bar.t));
      }
    });
    
    // Convert to array and sort
    const sortedDates = Array.from(allDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const labels = sortedDates.map(date => formatDate(date));

    // Create datasets for price data
    const priceDatasets = symbols.map((symbol, index) => {
      if (!data[symbol] || data[symbol].length === 0) return null;

      const prices = data[symbol].map(bar => bar.c);
      
      // Calculate price change for label
      const firstPrice = prices[0] || 0;
      const lastPrice = prices[prices.length - 1] || 0;
      const priceChange = lastPrice - firstPrice;
      const percentChange = (priceChange / firstPrice) * 100;
      
      const color = CHART_COLORS[index % CHART_COLORS.length];
      // For the main chart, use teal color as in the reference design
      const lineColor = index === 0 ? "#0fce9d" : color.line;

      return {
        label: `${symbol} (${priceChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)`,
        data: prices,
        borderColor: lineColor,
        backgroundColor: "rgba(15, 206, 157, 0.2)",
        fill: false,
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
      };
    }).filter(Boolean);

    // Create volume dataset for the first symbol
    const volumeDataset = symbols.length > 0 && data[symbols[0]] ? {
      label: 'Volume',
      data: data[symbols[0]].map(bar => bar.v),
      backgroundColor: data[symbols[0]].map((bar, i, arr) => {
        if (i === 0) return "rgba(15, 206, 157, 0.5)"; // Default to green for first bar
        return bar.c >= (arr[i-1]?.c || bar.o) ? "rgba(15, 206, 157, 0.5)" : "rgba(239, 68, 68, 0.5)";
      }),
      borderColor: "transparent",
      borderWidth: 0,
      type: 'bar' as const,
      barThickness: 4,
      yAxisID: 'volume',
      order: 1,
      // Add the missing properties required by TypeScript
      fill: false,
      tension: 0,
      pointRadius: 0,
      pointHoverRadius: 0,
    } : null;
    
    // Combine price and volume datasets
    const datasets = [...priceDatasets];
    if (volumeDataset) {
      datasets.push(volumeDataset);
    }

    return {
      labels,
      datasets
    };
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(15, 206, 157, 0.3)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        callbacks: {
          title: (tooltipItems) => {
            if (tooltipItems.length > 0) {
              // Display formatted date
              return tooltipItems[0].label.toLowerCase();
            }
            return '';
          },
          label: (tooltipItem) => {
            const symbol = symbols[0] || '';
            
            // For price dataset
            if (tooltipItem.datasetIndex === 0) {
              return `PRICE: $${Number(tooltipItem.parsed.y).toFixed(2)}`;
            }
            
            // For volume dataset
            if (tooltipItem.datasetIndex === 1) {
              const volumeValue = tooltipItem.parsed.y;
              return `VOLUME: ${volumeValue.toLocaleString()}`;
            }
            
            return '';
          }
        }
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)",
          // Remove drawBorder as it's not a valid property
          borderColor: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10
          }
        },
        border: {
          display: false
        }
      },
      y: {
        position: 'right',
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          // Remove drawBorder as it's not a valid property
          borderColor: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "#9ca3af",
          callback: (value) => `$${Number(value).toFixed(2)}`,
          font: {
            size: 10
          }
        },
        border: {
          display: false
        }
      },
      volume: {
        position: 'left',
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 500
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
    <div className="h-full relative bg-[#080a10]">
      <Line data={chartData as any} options={options} />
    </div>
  );
};

export default StockChart;

