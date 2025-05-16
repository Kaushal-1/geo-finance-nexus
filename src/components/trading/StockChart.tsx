
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
  BarElement,
  ChartOptions,
  ChartData,
  ChartDataset,
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

// Define custom dataset types to handle both line and bar charts
type LineDataset = ChartDataset<'line', number[]> & {
  fill: boolean;
  tension: number;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
};

type BarDataset = ChartDataset<'bar', number[]> & {
  barThickness: number;
  order: number;
};

// Union type for our mixed chart
type MixedChartDataset = LineDataset | BarDataset;

// Define chart data type
type MixedChartData = Omit<ChartData<'line', number[]>, 'datasets'> & {
  datasets: MixedChartDataset[];
};

const StockChart: React.FC<StockChartProps> = ({ data, symbols, isLoading }) => {
  // Prepare the chart data
  const chartData = useMemo<MixedChartData | null>(() => {
    if (isLoading || !data || symbols.length === 0) return null;

    const symbol = symbols[0]; // We're only displaying one symbol in trading dashboard
    const bars = data[symbol];

    if (!bars || bars.length === 0) return null;

    // Get dates for x-axis labels
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).toLowerCase();
    };

    const labels = bars.map(bar => formatDate(bar.t));
    const prices = bars.map(bar => bar.c);
    
    // Calculate volume data with colors
    const volumes = bars.map(bar => bar.v);
    const volumeColors = bars.map((bar, i) => {
      // If there's a previous bar, check if price went up or down
      if (i > 0) {
        return bar.c >= bars[i-1].c ? 'rgba(15, 206, 157, 0.6)' : 'rgba(239, 68, 68, 0.6)';
      }
      // For the first bar, use green
      return 'rgba(15, 206, 157, 0.6)';
    });

    // Find max volume to scale it appropriately in relation to price
    const maxVolume = Math.max(...volumes);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Scale volumes to be visible but not dominate the chart
    const scaledVolumes = volumes.map(vol => {
      // Scale volume to be about 20% of the price range
      return minPrice + (vol / maxVolume) * (priceRange * 0.15);
    });

    return {
      labels,
      datasets: [
        // Price dataset
        {
          label: 'Price',
          data: prices,
          borderColor: '#0FCE9D',
          backgroundColor: 'rgba(15, 206, 157, 0.1)',
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y',
          type: 'line' as const,
        },
        // Volume dataset
        {
          label: 'Volume',
          data: scaledVolumes,
          backgroundColor: volumeColors,
          borderColor: 'transparent',
          borderWidth: 0,
          type: 'bar' as const,
          barThickness: 4,
          yAxisID: 'y',
          order: 1,
          fill: false,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
        }
      ]
    };
  }, [data, symbols, isLoading]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        titleFont: {
          size: 14,
          weight: 'normal' as const,
        },
        bodyFont: {
          size: 14,
        },
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: any) => {
            return tooltipItems[0].label.toLowerCase();
          },
          label: (context: any) => {
            const { datasetIndex, dataset, parsed } = context;
            const label = dataset.label;
            
            if (datasetIndex === 0) {
              return `price: $${typeof parsed.y === 'number' ? parsed.y.toFixed(2) : parsed.y}`;
            } else {
              // Find the original volume value by reverse-engineering the scaled value
              const symbol = symbols[0];
              const bars = data[symbol];
              const index = context.dataIndex;
              if (bars && bars[index]) {
                return `volume: ${bars[index].v}`;
              }
              return `volume: ${parsed.y}`;
            }
          }
        }
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        position: 'bottom' as const,
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: {
            size: 10,
          }
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#9ca3af",
          callback: (value: number) => `$${value.toFixed(2)}`,
          font: {
            size: 10,
          }
        },
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
      <Line data={chartData as ChartData<'line'>} options={options} />
    </div>
  );
};

export default StockChart;
