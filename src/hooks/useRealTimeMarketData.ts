
import { useState, useEffect, useCallback } from 'react';
import { alpacaService } from '@/services/alpacaService';
import { toast } from "@/components/ui/use-toast";

interface RealTimeMarketData {
  price: number | null;
  prevClose: number | null;
  change: number | null;
  changePercent: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  lastUpdated: Date | null;
}

export function useRealTimeMarketData(symbol: string) {
  const [marketData, setMarketData] = useState<RealTimeMarketData>({
    price: null,
    prevClose: null,
    change: null,
    changePercent: null,
    high: null,
    low: null,
    volume: null,
    lastUpdated: null
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Function to fetch the latest trade and quote data
  const fetchLatestData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tradeResponse, quoteResponse] = await Promise.all([
        alpacaService.getLastTrade(symbol),
        alpacaService.getLastQuote(symbol)
      ]);
      
      if (tradeResponse && tradeResponse.trade) {
        const trade = tradeResponse.trade;
        
        // Get daily bars to calculate daily stats
        const dailyBars = await alpacaService.getBars(symbol, '1Day', 2);
        let prevClose = null;
        let high = null;
        let low = null;
        
        if (dailyBars && dailyBars.length > 0) {
          // If we have yesterday's data
          if (dailyBars.length > 1) {
            prevClose = dailyBars[0].c;
          }
          
          // Today's high and low
          high = dailyBars[dailyBars.length - 1].h;
          low = dailyBars[dailyBars.length - 1].l;
        }
        
        const price = trade.p;
        const change = prevClose ? price - prevClose : null;
        const changePercent = prevClose && prevClose !== 0 ? (change! / prevClose) * 100 : null;
        
        setMarketData({
          price,
          prevClose,
          change,
          changePercent,
          high,
          low,
          volume: trade.s || null, // Size of the trade
          lastUpdated: new Date()
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching latest market data:', error);
      setIsLoading(false);
    }
  }, [symbol]);
  
  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((data: any) => {
    if (data.T === 't') {  // Trade update
      const price = data.p;
      
      setMarketData(prev => {
        const change = prev.prevClose ? price - prev.prevClose : prev.change;
        const changePercent = prev.prevClose && prev.prevClose !== 0 
          ? ((price - prev.prevClose) / prev.prevClose) * 100 
          : prev.changePercent;
        
        // Update high/low if needed
        const high = prev.high === null ? price : Math.max(prev.high, price);
        const low = prev.low === null ? price : Math.min(prev.low, price);
        
        return {
          ...prev,
          price,
          change,
          changePercent,
          high,
          low,
          volume: (prev.volume || 0) + data.s, // Add trade size to volume
          lastUpdated: new Date()
        };
      });
    } else if (data.T === 'q') {  // Quote update
      // We could update bid/ask data here if needed
    }
  }, []);
  
  // Initial data fetch and subscription setup
  useEffect(() => {
    if (!symbol) return;
    
    // Initial data fetch
    fetchLatestData();
    
    // Set up real-time subscription
    const cleanup = alpacaService.subscribeToRealTimeData(symbol, handleRealTimeUpdate);
    
    // Periodically fetch data as a fallback for inactive symbols
    const intervalId = setInterval(() => {
      fetchLatestData();
    }, 60000); // Every minute
    
    return () => {
      cleanup();
      clearInterval(intervalId);
    };
  }, [symbol, fetchLatestData, handleRealTimeUpdate]);
  
  return { marketData, isLoading, refetch: fetchLatestData };
}
