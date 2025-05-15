
import React from "react";
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
  data: Bar[];
  symbol: string;
  isLoading?: boolean;
}

// Create a custom candlestick plugin for Chart.js
const candlestickPlugin = {
  id: 'candlestick',
  beforeDatasetsDraw(chart: any) {
    const { ctx, chartArea, scales } = chart;
    
    const dataset = chart.data.datasets[1];
    const xScale = scales.x;
    const yScale = scales.y;
    
    if (!dataset || dataset.hidden) return;
    
    ctx.save();
    ctx.lineWidth = 2;
    
    // Draw each candlestick
    for (let i = 0; i < dataset.data.length; i++) {
      const dataPoint = dataset.data[i];
      const x = xScale.getPixelForValue(dataPoint.x);
      const open = yScale.getPixelForValue(dataPoint.o);
      const high = yScale.getPixelForValue(dataPoint.h);
      const low = yScale.getPixelForValue(dataPoint.l);
      const close = yScale.getPixelForValue(dataPoint.c);
      
      const color = dataPoint.c >= dataPoint.o ? "#00b8a9" : "#f8485e";
      
      const candleWidth = (xScale.width / dataset.data.length) * 0.7;
      
      // Set stroke color for lines
      ctx.strokeStyle = color;
      
      // Draw high/low line (wick)
      ctx.beginPath();
      ctx.moveTo(x, high);
      ctx.lineTo(x, low);
      ctx.stroke();
      
      // Draw candle body
      const bodyHeight = Math.abs(close - open);
      const y = dataPoint.c >= dataPoint.o ? close : open;
      
      ctx.fillStyle = dataPoint.c >= dataPoint.o ? "#00b8a920" : "#f8485e20";
      ctx.strokeStyle = color;
      ctx.fillRect(x - candleWidth / 2, y, candleWidth, bodyHeight);
      ctx.strokeRect(x - candleWidth / 2, y, candleWidth, bodyHeight);
    }
    
    ctx.restore();
  }
};

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

  // Calculate price change color
  const firstPrice = data[0]?.c || 0;
  const lastPrice = data[data.length - 1]?.c || 0;
  const priceChange = lastPrice - firstPrice;
  const changeColor = priceChange >= 0 ? "#00b8a9" : "#f8485e";

  // Process closing price data for the line chart
  const labels = data.map(bar => formatDate(bar.t));
  const closingPrices = data.map(bar => bar.c);
  const volumes = data.map(bar => bar.v);
  const candleColors = data.map(bar => bar.c >= bar.o ? "#00b8a950" : "#f8485e50");
  
  // Create typed options for the chart
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context: any) => {
            if (context.dataset.label === 'Volume') {
              return `Volume: ${context.raw.y?.toLocaleString() || context.raw?.toLocaleString()}`;
            }
            if (context.datasetIndex === 1) {
              const dataPoint = data[context.dataIndex];
              return [
                `O: $${dataPoint.o.toFixed(2)}`,
                `H: $${dataPoint.h.toFixed(2)}`,
                `L: $${dataPoint.l.toFixed(2)}`,
                `C: $${dataPoint.c.toFixed(2)}`
              ];
            }
            const value = typeof context.raw === 'object' ? context.raw.y : context.raw;
            return `Price: $${value?.toFixed(2)}`;
          },
          title: (tooltipItems: any) => {
            return tooltipItems[0].label;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
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
          maxTicksLimit: 8
        }
      },
      y: {
        position: 'right',
        grid: {
          color: "rgba(255, 255, 255, 0.05)"
        },
        ticks: {
          color: "#9ca3af",
          callback: (value: number) => {
            return `$${value.toFixed(2)}`;
          }
        }
      },
      volume: {
        position: 'left',
        grid: {
          display: false
        },
        ticks: {
          color: "#9ca3af",
          callback: (value: number) => {
            return value >= 1000000 
              ? `${(value / 1000000).toFixed(1)}M`
              : value >= 1000 
                ? `${(value / 1000).toFixed(1)}K` 
                : value;
          }
        },
        display: true,
        suggestedMax: Math.max(...data.map(bar => bar.v)) * 2.5
      }
    }
  };
  
  // Create datasets with explicit typing for Chart.js
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      // Price line
      {
        type: 'line' as const,
        label: `${symbol} Price`,
        data: closingPrices,
        borderColor: changeColor,
        backgroundColor: `${changeColor}20`,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.2,
        yAxisID: 'y'
      },
      // Hidden dataset with candle data (for tooltip display)
      {
        type: 'line' as const,
        label: 'OHLC Data',
        data: data.map((bar, i) => ({
          x: i,
          y: bar.c,
          o: bar.o,
          h: bar.h,
          l: bar.l,
          c: bar.c
        })),
        borderColor: 'rgba(0,0,0,0)',
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        pointRadius: 0,
        yAxisID: 'y',
        hidden: true
      },
      // Volume bars
      {
        type: 'bar' as const,
        label: 'Volume',
        data: volumes,
        backgroundColor: candleColors,
        yAxisID: 'volume',
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }
    ]
  };
  
  return (
    <div className="chart-container h-[400px] relative">
      <div className="absolute top-2 left-2 z-10 flex flex-col">
        <span className="text-2xl font-bold text-white">${lastPrice.toFixed(2)}</span>
        <span className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({((priceChange / firstPrice) * 100).toFixed(2)}%)
        </span>
      </div>
      <Line 
        data={chartData} 
        options={options} 
        plugins={[candlestickPlugin]}
      />
    </div>
  );
};

export default StockChart;
