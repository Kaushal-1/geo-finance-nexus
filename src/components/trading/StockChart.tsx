
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

    // Create datasets
    const datasets = symbols.map((symbol, index) => {
      if (!data[symbol] || data[symbol].length === 0) return null;

      // Use normalized values to compare different stocks with different price ranges
      const firstPrice = data[symbol][0]?.c || 1;
      const normalizedData = data[symbol].map(bar => ({
        x: formatDate(bar.t),
        y: (bar.c / firstPrice) * 100 // Convert to percentage of first price
      }));

      // Calculate price change for label
      const lastPrice = data[symbol][data[symbol].length - 1]?.c || 0;
      const priceChange = lastPrice - firstPrice;
      const percentChange = (priceChange / firstPrice) * 100;
      
      const color = CHART_COLORS[index % CHART_COLORS.length];

      return {
        label: `${symbol} (${priceChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)`,
        data: normalizedData,
        borderColor: color.line,
        backgroundColor: color.background,
        fill: false,
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      };
    }).filter(Boolean);

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
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const symbol = datasetLabel.split(' ')[0];
            const value = context.parsed.y;
            return `${datasetLabel}: ${value.toFixed(2)}%`;
          }
        }
      },
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb', // text-gray-200
          usePointStyle: true,
          pointStyle: 'line',
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
          callback: (value) => `${value}%`,
        },
        title: {
          display: true,
          text: 'Relative Performance (%)',
          color: '#9ca3af',
        }
      },
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
    <div className="h-full relative">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;
