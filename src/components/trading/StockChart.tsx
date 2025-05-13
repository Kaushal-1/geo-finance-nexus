
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

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
  data: Bar[];
  symbol: string;
  isLoading?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ data, symbol, isLoading }) => {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-black/20 rounded-lg border border-gray-800">
        <div className="text-xl text-gray-400">
          {isLoading ? "Loading chart data..." : "No chart data available"}
        </div>
      </div>
    );
  }

  // Process data for Chart.js
  const chartData = {
    labels: data.map(bar => new Date(bar.t).toLocaleDateString()),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map(bar => bar.c),
        borderColor: "#00b8d4",
        backgroundColor: "rgba(0, 184, 212, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#fff"
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)"
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)"
        },
        ticks: {
          color: "#9ca3af",
          callback: (value: number) => {
            return `$${value.toFixed(2)}`;
          }
        }
      }
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false
    }
  };
  
  return (
    <div className="chart-wrapper h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;
