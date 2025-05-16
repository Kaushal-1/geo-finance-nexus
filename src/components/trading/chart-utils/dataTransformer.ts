
import { CandlestickData } from './indicatorUtils';

export interface ChartCandle {
  x: number;  // timestamp for chart rendering
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
}

export interface FormattedChartData {
  timestamps: string[];  // formatted dates for display
  candlesticks: ChartCandle[];
  volumes: number[];
  prices: number[];  // closing prices
  dates: Date[];     // actual date objects for calculations
}

// Format raw bar data into the structure needed for rendering
export const formatCandlestickData = (data: CandlestickData[]): FormattedChartData => {
  const timestamps: string[] = [];
  const candlesticks: ChartCandle[] = [];
  const volumes: number[] = [];
  const prices: number[] = [];
  const dates: Date[] = [];
  
  // Ensure data is sorted by time
  const sortedData = [...data].sort((a, b) => 
    new Date(a.t).getTime() - new Date(b.t).getTime()
  );
  
  sortedData.forEach((bar, index) => {
    const date = new Date(bar.t);
    dates.push(date);
    
    // Format the date string based on timeframe
    const formattedDate = formatDateForDisplay(date);
    timestamps.push(formattedDate);
    
    // Create candlestick data point
    candlesticks.push({
      x: index, // Use index as x for candlestick charts
      o: bar.o,
      h: bar.h,
      l: bar.l,
      c: bar.c
    });
    
    // Store volume and closing price
    volumes.push(bar.v);
    prices.push(bar.c);
  });
  
  return {
    timestamps,
    candlesticks,
    volumes,
    prices,
    dates
  };
};

// Format date based on the timeframe
export const formatDateForDisplay = (date: Date): string => {
  // For intraday data
  if (isIntraday(date)) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // For daily data
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Determine if we're looking at intraday data
const isIntraday = (date: Date): boolean => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // If time is not midnight (00:00), then it's likely intraday data
  return !(hours === 0 && minutes === 0);
};

// Generate colors based on price movement
export const generateCandleColors = (data: ChartCandle[]) => {
  return data.map((candle) => {
    // Bullish (close higher than open)
    if (candle.c > candle.o) {
      return {
        border: '#22c55e', // Green
        fill: 'rgba(34, 197, 94, 0.1)'
      };
    } 
    // Bearish (close lower than open)
    else if (candle.c < candle.o) {
      return {
        border: '#ef4444', // Red
        fill: 'rgba(239, 68, 68, 0.1)'
      };
    }
    // No change
    else {
      return {
        border: '#9ca3af', // Gray
        fill: 'rgba(156, 163, 175, 0.1)'
      };
    }
  });
};

// Function to determine volume bar colors
export const generateVolumeColors = (data: CandlestickData[]) => {
  return data.map((bar, index) => {
    // First bar or price increased
    if (index === 0 || bar.c >= data[index - 1].c) {
      return 'rgba(34, 197, 94, 0.5)'; // Green
    }
    // Price decreased
    return 'rgba(239, 68, 68, 0.5)'; // Red
  });
};
