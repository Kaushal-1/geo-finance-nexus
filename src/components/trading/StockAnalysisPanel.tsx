import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStockMetrics, fetchFundamentalData } from "@/services/technicalAnalysisService";
import TechnicalIndicatorGauge from "./TechnicalIndicatorGauge";

interface StockAnalysisPanelProps {
  symbol: string;
}

// Interface for technical analysis data
interface Technical {
  symbol: string;
  currentPrice: number;
  weekHigh: number;
  weekLow: number;
  ma50: number;
  ma200: number;
  rsi: number;
  macd: number | string;
  macdSignal: number;
  macdHistogram: number;
  volume: number;
  avgVolume: number;
  volumeTrend: string;
  lastUpdated: string;
}

// Interface for fundamental data
interface Fundamental {
  peRatio: number | string;
  marketCap: number | string;
  dividendYield: number | string;
  beta: number | string;
}

const StockAnalysisPanel: React.FC<StockAnalysisPanelProps> = ({ symbol }) => {
  const [technical, setTechnical] = useState<Technical | null>(null);
  const [fundamental, setFundamental] = useState<Fundamental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch technical metrics
        const technicalData = await fetchStockMetrics(symbol);
        setTechnical(technicalData);
        
        // Fetch fundamental data
        const fundamentalData = await fetchFundamentalData(symbol);
        setFundamental(fundamentalData);
      } catch (err) {
        console.error("Error fetching stock analysis:", err);
        setError(`Failed to load analysis data for ${symbol}`);
      } finally {
        setLoading(false);
      }
    };
    
    getData();
  }, [symbol]);

  // Calculate indicator states
  const getTrendStatus = (data: Technical | null): { bullishBearish: string; value: number } => {
    if (!data) return { bullishBearish: 'neutral', value: 50 };
    
    let bullishFactors = 0;
    let bearishFactors = 0;
    
    // Price above MA50 is bullish
    if (data.currentPrice > data.ma50) bullishFactors += 2;
    else bearishFactors += 2;
    
    // Price above MA200 is bullish
    if (data.currentPrice > data.ma200) bullishFactors += 2;
    else bearishFactors += 2;
    
    // RSI below 30 is oversold (bullish), above 70 is overbought (bearish)
    if (data.rsi < 30) bullishFactors += 3;
    else if (data.rsi > 70) bearishFactors += 3;
    else if (data.rsi < 45) bullishFactors += 1;
    else if (data.rsi > 55) bearishFactors += 1;
    
    // MACD above signal line is bullish
    if (data.macdHistogram > 0.5) bullishFactors += 3;
    else if (data.macdHistogram < -0.5) bearishFactors += 3;
    else if (data.macdHistogram > 0) bullishFactors += 1;
    else bearishFactors += 1;
    
    // Volume trend
    if (data.volumeTrend === 'Above Average') bullishFactors += 1;
    else bearishFactors += 1;
    
    // Calculate score (0-100)
    const totalFactors = bullishFactors + bearishFactors;
    const value = Math.round((bullishFactors / totalFactors) * 100);
    
    // Determine status
    let bullishBearish;
    if (value >= 70) bullishBearish = 'bullish';
    else if (value <= 30) bullishBearish = 'bearish';
    else bullishBearish = 'neutral';
    
    return { bullishBearish, value };
  };
  
  // Function to get moving averages status
  const getMovingAveragesStatus = (data: Technical | null): { status: string; value: number } => {
    if (!data) return { status: 'neutral', value: 50 };
    
    const currentPrice = data.currentPrice;
    const ma50 = data.ma50;
    const ma200 = data.ma200;
    
    // Calculate moving average score
    let score = 50;
    
    // Price above both MAs
    if (currentPrice > ma50 && currentPrice > ma200) {
      score += 30;
    }
    // Price between MAs
    else if ((currentPrice > ma50 && currentPrice < ma200) || 
             (currentPrice < ma50 && currentPrice > ma200)) {
      score += 15;
    }
    // Price below both MAs
    else {
      score -= 15;
    }
    
    // MA50 above MA200 (golden cross)
    if (ma50 > ma200) {
      score += 20;
    }
    // MA50 below MA200 (death cross)
    else {
      score -= 10;
    }
    
    // Ensure score is within range
    score = Math.max(0, Math.min(100, score));
    
    let status;
    if (score >= 70) status = 'strong';
    else if (score <= 30) status = 'weak';
    else status = 'neutral';
    
    return { status, value: score };
  };
  
  // Calculate RSI status
  const getRSIStatus = (data: Technical | null): { status: string; value: number } => {
    if (!data) return { status: 'neutral', value: 50 };
    
    const rsi = data.rsi;
    let status;
    
    if (rsi >= 70) status = 'overbought';
    else if (rsi <= 30) status = 'oversold';
    else status = 'neutral';
    
    return { status, value: rsi };
  };
  
  // Calculate MACD status
  const getMACDStatus = (data: Technical | null): { status: string; value: number } => {
    if (!data) return { status: 'neutral', value: 50 };
    
    const histogram = data.macdHistogram;
    let status;
    
    if (histogram > 0.5) status = 'strong';
    else if (histogram < -0.5) status = 'weak';
    else status = 'neutral';
    
    // Normalize histogram to 0-100 scale for gauge
    const value = Math.max(0, Math.min(100, 50 + histogram * 20));
    
    return { status, value };
  };

  // Determine Trend status
  const trendStatus = getTrendStatus(technical);
  
  // Determine Moving Averages status
  const movingAveragesStatus = getMovingAveragesStatus(technical);
  
  // Determine RSI status
  const rsiStatus = getRSIStatus(technical);
  
  // Determine MACD status
  const macdStatus = getMACDStatus(technical);

  // Format percentage for display
  const formatPercent = (value: number | string | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'string') return value;
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Card className="bg-black/20 border-gray-800 backdrop-blur-sm h-full">
        <CardHeader>
          <CardTitle>Technical Analysis: {symbol}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[20px] w-2/3 bg-gray-800" />
          <Skeleton className="h-[100px] w-full bg-gray-800" />
          <Skeleton className="h-[70px] w-full bg-gray-800" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/20 border-gray-800 backdrop-blur-sm h-full">
        <CardHeader>
          <CardTitle>Technical Analysis: {symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Technical Analysis: {symbol}</span>
          {technical && <span className="text-lg">${technical.currentPrice}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">52-Week Range</h3>
          <div className="relative h-2 bg-gray-800 rounded-full">
            {technical && (
              <>
                <div className="absolute h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded-full" />
                <div 
                  className="absolute w-2 h-4 bg-white rounded-full -mt-1" 
                  style={{ 
                    left: `${((technical.currentPrice - technical.weekLow) / (technical.weekHigh - technical.weekLow)) * 100}%`,
                    transform: 'translateX(-50%)' 
                  }} 
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>${technical.weekLow}</span>
                  <span>${technical.weekHigh}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overall Trend */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Overall Trend</h3>
            <TechnicalIndicatorGauge 
              value={trendStatus.value} 
              status={trendStatus.bullishBearish}
            />
            {technical && (
              <div className="text-xs mt-1 text-center">
                <span className={`font-semibold ${trendStatus.value > 60 ? 'text-blue-500' : trendStatus.value < 40 ? 'text-red-500' : 'text-gray-400'}`}>
                  {trendStatus.value}% {trendStatus.value > 60 ? 'Bullish' : trendStatus.value < 40 ? 'Bearish' : 'Neutral'}
                </span>
              </div>
            )}
          </div>
          
          {/* Moving Averages */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Moving Averages</h3>
            <TechnicalIndicatorGauge 
              value={movingAveragesStatus.value} 
              status={movingAveragesStatus.status} 
            />
            {technical && (
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div>
                  <span className="text-gray-400">50-day: </span>
                  <span className={technical.currentPrice > technical.ma50 ? "text-blue-500" : "text-red-500"}>
                    ${technical.ma50.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">200-day: </span>
                  <span className={technical.currentPrice > technical.ma200 ? "text-blue-500" : "text-red-500"}>
                    ${technical.ma200.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Current: </span>
                  <span>${technical.currentPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* RSI */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">RSI ({technical?.rsi.toFixed(1)})</h3>
            <TechnicalIndicatorGauge 
              value={rsiStatus.value} 
              status={rsiStatus.status}
              min={0}
              max={100}
              thresholds={[30, 70]}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span className="text-green-500">Oversold</span>
              <span>Neutral</span>
              <span className="text-red-500">Overbought</span>
            </div>
          </div>
          
          {/* MACD */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">MACD</h3>
            <TechnicalIndicatorGauge 
              value={macdStatus.value} 
              status={macdStatus.status} 
            />
            {technical && (
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div>
                  <span className="text-gray-400">MACD: </span>
                  <span>{typeof technical.macd === 'number' ? technical.macd.toFixed(2) : technical.macd}</span>
                </div>
                <div>
                  <span className="text-gray-400">Signal: </span>
                  <span>{technical.macdSignal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Hist: </span>
                  <span className={technical.macdHistogram > 0 ? "text-blue-500" : "text-red-500"}>
                    {technical.macdHistogram.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Fundamental Data */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Fundamental Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-800/50 rounded p-2">
              <span className="text-gray-400 block text-xs">P/E Ratio</span>
              <span className="font-semibold">{fundamental?.peRatio || 'N/A'}</span>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <span className="text-gray-400 block text-xs">Market Cap</span>
              <span className="font-semibold">
                {fundamental?.marketCap ? `$${fundamental.marketCap}B` : 'N/A'}
              </span>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <span className="text-gray-400 block text-xs">Dividend Yield</span>
              <span className="font-semibold">{formatPercent(fundamental?.dividendYield)}</span>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <span className="text-gray-400 block text-xs">Beta</span>
              <span className="font-semibold">{fundamental?.beta || 'N/A'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockAnalysisPanel;
