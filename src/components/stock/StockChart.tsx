
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { finnhubService } from '@/services/finnhubService';
import { useToast } from '@/components/ui/use-toast';

interface StockChartProps {
  symbol: string;
  timeframe: string;
  className?: string;
}

interface ChartData {
  date: string;
  price: number;
  volume?: number;
}

const StockChart: React.FC<StockChartProps> = ({ 
  symbol, 
  timeframe,
  className = "h-[300px]" 
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [volumeData, setVolumeData] = useState<ChartData[]>([]);
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadChartData = async () => {
      // Don't load if we have an invalid symbol
      if (!symbol || symbol === ":symbol") {
        setError("No valid symbol provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const currentDate = new Date();
        let fromDate;

        // Set the time range based on the selected timeframe
        switch (timeframe) {
          case '1D':
            fromDate = new Date(currentDate);
            fromDate.setDate(currentDate.getDate() - 1);
            break;
          case '1W':
            fromDate = new Date(currentDate);
            fromDate.setDate(currentDate.getDate() - 7);
            break;
          case '1M':
            fromDate = new Date(currentDate);
            fromDate.setMonth(currentDate.getMonth() - 1);
            break;
          case '3M':
            fromDate = new Date(currentDate);
            fromDate.setMonth(currentDate.getMonth() - 3);
            break;
          case '1Y':
            fromDate = new Date(currentDate);
            fromDate.setFullYear(currentDate.getFullYear() - 1);
            break;
          case '5Y':
            fromDate = new Date(currentDate);
            fromDate.setFullYear(currentDate.getFullYear() - 5);
            break;
          default:
            fromDate = new Date(currentDate);
            fromDate.setDate(currentDate.getDate() - 7); // Default to 1 week
        }

        // Adjust resolution based on timeframe
        let resolution = 'D'; // Default daily
        if (timeframe === '1D') resolution = '15';
        if (timeframe === '5Y') resolution = 'W';

        console.log(`Fetching chart data for ${symbol} with timeframe ${timeframe}`);
        const candles = await finnhubService.getCandles(symbol, resolution, fromDate);

        if (!candles || candles.length === 0) {
          // If no data and we haven't retried much, retry
          if (retryCount < 3) {
            console.log(`Retry attempt ${retryCount + 1} for chart data`);
            setRetryCount(prev => prev + 1);
            // Wait a bit longer between retries
            setTimeout(() => loadChartData(), 2000 * (retryCount + 1));
            return;
          }
          
          setError('No chart data available');
          setLoading(false);
          return;
        }

        // Format data for the chart
        const formattedData = candles.map((candle: any) => {
          const date = new Date(candle.timestamp);
          return {
            date: timeframe === '1D'
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            price: candle.close || 0,
            volume: candle.volume || 0
          };
        });

        // Reset retry count on success
        setRetryCount(0);
        setChartData(formattedData);

        // Create separate volume data
        if (formattedData[0]?.volume) {
          setVolumeData(formattedData);
        } else {
          setVolumeData([]);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error loading chart data:', err);
        
        // If API rate limited, retry with backoff
        if (err.message?.includes('rate limit')) {
          if (retryCount < 5) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => loadChartData(), delay);
            return;
          }
        }
        
        setError('Failed to load chart data. API may be temporarily unavailable.');
        setLoading(false);
        
        toast({
          title: "Chart loading error",
          description: "Could not load the chart data. The API may be temporarily unavailable.",
          variant: "destructive",
        });
      }
    };

    loadChartData();
  }, [symbol, timeframe]);

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
          <p className="text-muted-foreground">No chart data available</p>
        </div>
      </div>
    );
  }

  // Calculate if the stock is up or down
  const isUp = chartData.length > 1 && 
    chartData[chartData.length - 1].price >= chartData[0].price;
  
  const chartColor = isUp ? "rgba(0, 230, 118, 1)" : "rgba(255, 82, 82, 1)";
  const gradientColor = isUp ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 82, 82, 0.1)";

  const formatYAxis = (value: number) => {
    if (value === undefined || value === null) return '0';
    return value.toFixed(2);
  };

  const formatTooltip = (value: number, name: string) => {
    if (value === undefined || value === null) value = 0;
    
    if (name === 'price') {
      return [`$${value.toFixed(2)}`, 'Price'];
    }
    if (name === 'volume') {
      if (value > 1000000) {
        return [`${(value / 1000000).toFixed(2)}M`, 'Volume'];
      } else if (value > 1000) {
        return [`${(value / 1000).toFixed(2)}K`, 'Volume'];
      }
      return [value.toString(), 'Volume'];
    }
    return [value.toString(), name];
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#888888', fontSize: 12 }}
            tickMargin={10}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            minTickGap={10}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            domain={['auto', 'auto']} 
            tick={{ fill: '#888888', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickMargin={10}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: '#1a2035', 
              borderColor: '#455a64',
              borderRadius: '4px',
              fontSize: '12px'
            }} 
            labelStyle={{ color: '#90a4ae' }}
            itemStyle={{ color: '#f5f7fa' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={chartColor} 
            strokeWidth={2}
            fill="url(#colorPrice)" 
            activeDot={{ r: 6, fill: chartColor }} 
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Volume Chart (only if there's volume data) */}
      {volumeData.length > 0 && (
        <div className="h-[20%] mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <XAxis 
                dataKey="date"
                tick={false}
                height={0}
                axisLine={false}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  backgroundColor: '#1a2035', 
                  borderColor: '#455a64',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="volume" 
                fill={chartColor} 
                fillOpacity={0.3} 
                barSize={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StockChart;
