
import React, { useMemo, useState } from "react";
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
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getPerplexityApiKey } from "@/services/chatService";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
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

interface ForecastData {
  current: number;
  max: { value: number, percent: number };
  min: { value: number, percent: number };
  avg: { value: number, percent: number };
}

// Define chart colors for different stocks
const CHART_COLORS = [
  { line: "#3bf4c2", background: "rgba(59, 244, 194, 0.1)" }, // teal
  { line: "#f59e0b", background: "rgba(245, 158, 11, 0.2)" }, // amber
  { line: "#10b981", background: "rgba(16, 185, 129, 0.2)" }, // emerald
  { line: "#ef4444", background: "rgba(239, 68, 68, 0.2)" },  // red
];

const StockChart: React.FC<StockChartProps> = ({ data, symbols, isLoading }) => {
  const [showForecast, setShowForecast] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // Prepare the chart data
  const chartData = useMemo(() => {
    if (isLoading || !data || symbols.length === 0) return null;

    // Only use the first symbol for the main chart
    const symbol = symbols[0];
    
    if (!data[symbol] || data[symbol].length === 0) {
      return null;
    }

    const stockData = data[symbol];
    
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

    const labels = stockData.map(bar => formatDate(bar.t));
    const prices = stockData.map(bar => bar.c);
    const volumes = stockData.map(bar => bar.v);
    
    // Calculate max volume for scaling
    const maxVolume = Math.max(...volumes);
    // Scale volumes to be visible but not dominate the chart
    const scaledVolumes = volumes.map(vol => (vol / maxVolume) * 0.3 * Math.max(...prices));
    
    const color = CHART_COLORS[0];

    // Create the main price dataset
    const datasets = [
      {
        label: `${symbol} Price`,
        data: prices,
        borderColor: color.line,
        backgroundColor: color.background,
        fill: true,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: `${symbol} Volume`,
        data: scaledVolumes,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 0)',
        borderWidth: 0,
        type: 'bar' as const,
        barThickness: 3,
        yAxisID: 'y',
        order: 1
      }
    ];

    // Add forecast data if available
    if (showForecast && forecastData) {
      const lastPrice = prices[prices.length - 1];
      const lastDate = labels[labels.length - 1];
      
      // Add current marker
      datasets.push({
        label: 'Current',
        data: [{ x: lastDate, y: forecastData.current }],
        borderColor: '#3388ff',
        backgroundColor: '#3388ff',
        pointRadius: 5,
        pointHoverRadius: 8,
        showLine: false,
        yAxisID: 'y'
      });
      
      // Add forecast line (horizontal)
      const forecastEndDate = 'May 30, 2026';
      
      // Max line
      datasets.push({
        label: `Max +${forecastData.max.percent.toFixed(2)}%`,
        data: [
          { x: lastDate, y: forecastData.current },
          { x: forecastEndDate, y: forecastData.max.value }
        ],
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0,
        yAxisID: 'y'
      });
      
      // Avg line
      datasets.push({
        label: `Avg +${forecastData.avg.percent.toFixed(2)}%`,
        data: [
          { x: lastDate, y: forecastData.current },
          { x: forecastEndDate, y: forecastData.avg.value }
        ],
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0,
        yAxisID: 'y'
      });
      
      // Min line
      datasets.push({
        label: `Min -${Math.abs(forecastData.min.percent).toFixed(2)}%`,
        data: [
          { x: lastDate, y: forecastData.current },
          { x: forecastEndDate, y: forecastData.min.value }
        ],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0,
        yAxisID: 'y'
      });
      
      // Add forecast range area
      datasets.push({
        label: 'Forecast Range',
        data: [
          { x: lastDate, y: forecastData.current },
          { x: forecastEndDate, y: forecastData.max.value }
        ],
        borderColor: 'transparent',
        backgroundColor: 'rgba(74, 222, 128, 0.1)', // green tint
        fill: '+1',
        tension: 0,
        yAxisID: 'y'
      });
      
      datasets.push({
        label: 'Forecast Range',
        data: [
          { x: lastDate, y: forecastData.current },
          { x: forecastEndDate, y: forecastData.min.value }
        ],
        borderColor: 'transparent',
        backgroundColor: 'rgba(244, 63, 94, 0.1)', // red tint
        fill: '+1',
        tension: 0,
        yAxisID: 'y'
      });
    }

    return {
      labels,
      datasets
    };
  }, [data, symbols, isLoading, showForecast, forecastData]);

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
            const value = context.parsed.y;
            
            if (datasetLabel.includes('Volume')) {
              const originalVolume = data[symbols[0]]?.[context.dataIndex]?.v;
              return `Volume: ${originalVolume}`;
            }
            
            if (datasetLabel.includes('Max') || datasetLabel.includes('Min') || datasetLabel.includes('Avg')) {
              return `${datasetLabel}: $${value.toFixed(2)}`;
            }
            
            return `${datasetLabel}: $${value.toFixed(2)}`;
          }
        }
      },
      legend: {
        display: showForecast,
        position: 'top',
        labels: {
          color: '#e5e7eb', // text-gray-200
          usePointStyle: true,
          pointStyle: 'line',
          filter: (item) => {
            // Hide certain datasets from legend
            return !item.text.includes('Volume') && !item.text.includes('Forecast Range');
          }
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
          callback: (value) => `$${value}`,
        },
        title: {
          display: true,
          text: showForecast ? 'Price & Forecast ($)' : 'Price ($)',
          color: '#9ca3af',
        }
      },
    }
  };

  const fetchForecastData = async () => {
    setIsForecastLoading(true);
    try {
      const apiKey = getPerplexityApiKey();
      
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "Please set the Perplexity API key in your account settings.",
          variant: "destructive",
        });
        setIsForecastLoading(false);
        return;
      }
      
      const symbol = symbols[0];
      if (!symbol || !data[symbol] || data[symbol].length === 0) {
        throw new Error("No stock data available for forecast");
      }
      
      const stockData = data[symbol];
      const currentPrice = stockData[stockData.length - 1].c;
      
      // Construct the query for price forecast
      const query = `You are a financial analyst. I need a 1-year price forecast for ${symbol} stock.
      The current price is $${currentPrice} as of May 2025.
      
      Analyze market trends, company performance, and sector outlook to provide:
      1. Maximum price target with percentage increase from current
      2. Minimum price target with percentage decrease from current
      3. Average expected price with percentage change from current
      
      Format output as valid JSON with these fields:
      - current: current price (number)
      - max: {value: max price forecast (number), percent: percentage increase (number)}
      - min: {value: min price forecast (number), percent: percentage decrease (number)}
      - avg: {value: average price forecast (number), percent: percentage change (number)}`;

      // Call the Perplexity API
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a financial analyst providing accurate stock price forecasts based on available data. Your output must be in JSON format."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();
      const content = responseData.choices[0].message.content;

      // Extract JSON from the response
      const jsonPattern = /```json([\s\S]*?)```|({[\s\S]*})/;
      const match = jsonPattern.exec(content);
      
      if (match) {
        let jsonString = match[1] || match[2];
        // Clean up the string
        jsonString = jsonString.trim();
        
        const forecast = JSON.parse(jsonString);
        setForecastData(forecast);
        setShowForecast(true);
        
        toast({
          title: "Forecast Generated",
          description: `1-year price forecast for ${symbol} generated successfully`,
        });
      } else {
        throw new Error("Could not parse forecast data");
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      toast({
        title: "Forecast Error",
        description: `Could not generate forecast: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsForecastLoading(false);
    }
  };

  const toggleForecast = () => {
    if (!showForecast && !forecastData) {
      fetchForecastData();
    } else {
      setShowForecast(!showForecast);
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
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-2">
        <Button 
          onClick={toggleForecast}
          variant="outline" 
          size="sm"
          className={`border-gray-700 ${isForecastLoading ? 'opacity-50' : ''} ${showForecast ? 'bg-teal-700/30' : ''}`}
          disabled={isForecastLoading}
        >
          {isForecastLoading ? 'Loading...' : showForecast ? 'Hide Forecast' : 'Check Forecast'}
        </Button>
      </div>
      <div className="relative h-[calc(100%-2.5rem)]">
        <Line data={chartData} options={options} />
        {showForecast && (
          <div className="absolute top-0 right-0 bg-gray-900/80 border border-gray-700 p-1 px-3 rounded text-xs">
            <span className="text-gray-300">1Y FORECAST</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;
