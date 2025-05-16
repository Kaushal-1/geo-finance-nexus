
// Utility functions to compute technical indicators for the chart

export interface CandlestickData {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

// Calculate Simple Moving Average (SMA)
export const calculateSMA = (data: CandlestickData[], period: number): number[] => {
  const closes = data.map(candle => candle.c);
  const sma: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      sma.push(NaN); // Not enough data for SMA calculation
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += closes[i - j];
    }
    sma.push(Number((sum / period).toFixed(2)));
  }
  
  return sma;
};

// Calculate Exponential Moving Average (EMA)
export const calculateEMA = (data: CandlestickData[], period: number): number[] => {
  const closes = data.map(candle => candle.c);
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Initialize EMA with SMA for the first data point
  let initialSMA = 0;
  for (let i = 0; i < period; i++) {
    initialSMA += closes[i];
  }
  initialSMA /= period;
  
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      ema.push(NaN); // Not enough data
      continue;
    }
    
    if (i === period - 1) {
      ema.push(Number(initialSMA.toFixed(2)));
      continue;
    }
    
    const currentEMA = (closes[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(Number(currentEMA.toFixed(2)));
  }
  
  return ema;
};

// Calculate Relative Strength Index (RSI)
export const calculateRSI = (data: CandlestickData[], period: number = 14): number[] => {
  const closes = data.map(candle => candle.c);
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // First calculate gains and losses
  for (let i = 1; i < closes.length; i++) {
    const difference = closes[i] - closes[i - 1];
    gains.push(difference > 0 ? difference : 0);
    losses.push(difference < 0 ? Math.abs(difference) : 0);
  }
  
  // Calculate average gains and losses
  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      rsi.push(NaN); // Not enough data
      continue;
    }
    
    let avgGain = 0;
    let avgLoss = 0;
    
    if (i === period) {
      // First RSI value uses simple average
      for (let j = 0; j < period; j++) {
        avgGain += gains[j];
        avgLoss += losses[j];
      }
      avgGain /= period;
      avgLoss /= period;
    } else {
      // Subsequent values use smoothed average
      avgGain = (rsiGains[rsiGains.length - 1] * (period - 1) + gains[i - 1]) / period;
      avgLoss = (rsiLosses[rsiLosses.length - 1] * (period - 1) + losses[i - 1]) / period;
    }
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(Number((100 - (100 / (1 + rs))).toFixed(2)));
    }
    
    rsiGains.push(avgGain);
    rsiLosses.push(avgLoss);
  }
  
  return rsi;
};

// Calculate MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data: CandlestickData[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const closes = data.map(candle => candle.c);
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line (difference between fast and slow EMAs)
  const macdLine = emaFast.map((fast, index) => {
    if (isNaN(fast) || isNaN(emaSlow[index])) return NaN;
    return Number((fast - emaSlow[index]).toFixed(2));
  });
  
  // Filter out NaN values for signal line calculation
  const validMacd = macdLine.filter(val => !isNaN(val));
  
  // Calculate signal line (EMA of MACD line)
  const multiplier = 2 / (signalPeriod + 1);
  const signalLine: number[] = [];
  let signalSMA = 0;
  
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i]) || i < slowPeriod - 1 + signalPeriod - 1) {
      signalLine.push(NaN);
      continue;
    }
    
    if (i === slowPeriod - 1 + signalPeriod - 1) {
      // Initialize signal line with SMA of MACD for the first signalPeriod points
      for (let j = 0; j < signalPeriod; j++) {
        signalSMA += validMacd[j];
      }
      signalSMA /= signalPeriod;
      signalLine.push(Number(signalSMA.toFixed(2)));
      continue;
    }
    
    // EMA calculation for signal line
    const prevSignal = signalLine[signalLine.length - 1];
    const newSignal = (macdLine[i] - prevSignal) * multiplier + prevSignal;
    signalLine.push(Number(newSignal.toFixed(2)));
  }
  
  // Calculate histogram (MACD line - signal line)
  const histogram = macdLine.map((macd, index) => {
    if (isNaN(macd) || isNaN(signalLine[index])) return NaN;
    return Number((macd - signalLine[index]).toFixed(2));
  });
  
  return {
    macdLine,
    signalLine,
    histogram
  };
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (data: CandlestickData[], period = 20, standardDeviations = 2) => {
  const closes = data.map(candle => candle.c);
  const sma = calculateSMA(data, period);
  
  // Calculate standard deviation for each point
  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upperBand.push(NaN);
      lowerBand.push(NaN);
      continue;
    }
    
    let sumSquaredDiff = 0;
    for (let j = 0; j < period; j++) {
      sumSquaredDiff += Math.pow(closes[i - j] - sma[i], 2);
    }
    
    const standardDeviation = Math.sqrt(sumSquaredDiff / period);
    
    upperBand.push(Number((sma[i] + (standardDeviation * standardDeviations)).toFixed(2)));
    lowerBand.push(Number((sma[i] - (standardDeviation * standardDeviations)).toFixed(2)));
  }
  
  return {
    middle: sma,
    upper: upperBand,
    lower: lowerBand
  };
};

// Helper arrays for RSI calculation
const rsiGains: number[] = [];
const rsiLosses: number[] = [];
