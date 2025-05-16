
import { CandlestickData } from './indicatorUtils';

// Bollinger Bands calculation
export const calculateBollingerBands = (data: CandlestickData[], period = 20, stdDev = 2): { 
  middle: number[]; 
  upper: number[]; 
  lower: number[] 
} => {
  const prices = data.map(bar => bar.c);
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      // Not enough data yet
      middle.push(NaN);
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    
    // Calculate SMA for the period
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += prices[j];
    }
    const sma = sum / period;
    middle.push(sma);
    
    // Calculate standard deviation
    let squaredDiffSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = prices[j] - sma;
      squaredDiffSum += diff * diff;
    }
    const standardDeviation = Math.sqrt(squaredDiffSum / period);
    
    // Calculate upper and lower bands
    upper.push(sma + stdDev * standardDeviation);
    lower.push(sma - stdDev * standardDeviation);
  }
  
  return { middle, upper, lower };
};

// VWAP (Volume Weighted Average Price)
export const calculateVWAP = (data: CandlestickData[]): number[] => {
  const vwap: number[] = [];
  let cumulativeTPV = 0; // Typical Price * Volume
  let cumulativeVolume = 0;
  
  data.forEach((bar, index) => {
    const typicalPrice = (bar.h + bar.l + bar.c) / 3;
    const tpv = typicalPrice * bar.v;
    
    cumulativeTPV += tpv;
    cumulativeVolume += bar.v;
    
    const currentVWAP = cumulativeTPV / cumulativeVolume;
    vwap.push(currentVWAP);
  });
  
  return vwap;
};

// ATR (Average True Range)
export const calculateATR = (data: CandlestickData[], period = 14): number[] => {
  const trueRanges: number[] = [];
  const atr: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      // First candle, use high - low
      trueRanges.push(data[i].h - data[i].l);
      atr.push(NaN);
      continue;
    }
    
    // Calculate true range
    const highLow = data[i].h - data[i].l;
    const highPrevClose = Math.abs(data[i].h - data[i-1].c);
    const lowPrevClose = Math.abs(data[i].l - data[i-1].c);
    const tr = Math.max(highLow, highPrevClose, lowPrevClose);
    trueRanges.push(tr);
    
    if (i < period) {
      atr.push(NaN);
      continue;
    }
    
    if (i === period) {
      // First ATR is simple average of first 'period' true ranges
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += trueRanges[j];
      }
      atr.push(sum / period);
    } else {
      // Rest are smoothed using previous ATR
      atr.push((atr[i-1] * (period - 1) + trueRanges[i]) / period);
    }
  }
  
  return atr;
};

// Ichimoku Cloud
export const calculateIchimokuCloud = (data: CandlestickData[], 
  params = { conversion: 9, base: 26, spanB: 52, displacement: 26 }
): {
  conversionLine: number[];
  baseLine: number[];
  leadingSpanA: number[];
  leadingSpanB: number[];
  laggingSpan: number[];
} => {
  const highsConv = [];
  const lowsConv = [];
  const highsBase = [];
  const lowsBase = [];
  const highsSpanB = [];
  const lowsSpanB = [];
  
  // Extract highs and lows for each period
  for (let i = 0; i < data.length; i++) {
    // For Conversion Line (Tenkan-sen)
    if (i >= params.conversion - 1) {
      const highSlice = data.slice(i - params.conversion + 1, i + 1).map(d => d.h);
      const lowSlice = data.slice(i - params.conversion + 1, i + 1).map(d => d.l);
      highsConv.push(Math.max(...highSlice));
      lowsConv.push(Math.min(...lowSlice));
    } else {
      highsConv.push(NaN);
      lowsConv.push(NaN);
    }
    
    // For Base Line (Kijun-sen)
    if (i >= params.base - 1) {
      const highSlice = data.slice(i - params.base + 1, i + 1).map(d => d.h);
      const lowSlice = data.slice(i - params.base + 1, i + 1).map(d => d.l);
      highsBase.push(Math.max(...highSlice));
      lowsBase.push(Math.min(...lowSlice));
    } else {
      highsBase.push(NaN);
      lowsBase.push(NaN);
    }
    
    // For Leading Span B (Senkou Span B)
    if (i >= params.spanB - 1) {
      const highSlice = data.slice(i - params.spanB + 1, i + 1).map(d => d.h);
      const lowSlice = data.slice(i - params.spanB + 1, i + 1).map(d => d.l);
      highsSpanB.push(Math.max(...highSlice));
      lowsSpanB.push(Math.min(...lowSlice));
    } else {
      highsSpanB.push(NaN);
      lowsSpanB.push(NaN);
    }
  }
  
  // Calculate the lines
  const conversionLine = highsConv.map((h, i) => (h + lowsConv[i]) / 2);
  const baseLine = highsBase.map((h, i) => (h + lowsBase[i]) / 2);
  
  // Calculate Leading Span A (Senkou Span A)
  const leadingSpanA = conversionLine.map((cl, i) => {
    if (isNaN(cl) || isNaN(baseLine[i])) return NaN;
    return (cl + baseLine[i]) / 2;
  });
  
  // Calculate Leading Span B (Senkou Span B)
  const leadingSpanB = highsSpanB.map((h, i) => (h + lowsSpanB[i]) / 2);
  
  // Calculate Lagging Span (Chikou Span)
  const laggingSpan = data.map(d => d.c);
  
  return {
    conversionLine,
    baseLine,
    leadingSpanA,
    leadingSpanB,
    laggingSpan
  };
};
