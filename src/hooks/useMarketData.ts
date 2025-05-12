
import { useState, useEffect } from 'react';
import { 
  getMarketData, 
  getAsianMarketData, 
  getEuropeanMarketData, 
  startMarketDataUpdates, 
  FormattedMarketData 
} from '@/services/marketService';

export function useMarketData() {
  const [usMarketData, setUsMarketData] = useState<FormattedMarketData[]>(getMarketData());
  const [asianMarketData, setAsianMarketData] = useState<FormattedMarketData[]>(getAsianMarketData());
  const [europeanMarketData, setEuropeanMarketData] = useState<FormattedMarketData[]>(getEuropeanMarketData());
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const updateMarkets = () => {
      setUsMarketData(getMarketData());
      setAsianMarketData(getAsianMarketData());
      setEuropeanMarketData(getEuropeanMarketData());
      setLastUpdated(new Date());
    };

    // Initial update
    updateMarkets();

    // Set up interval for updates
    const cleanup = startMarketDataUpdates(data => {
      setUsMarketData(data);
      setAsianMarketData(getAsianMarketData());
      setEuropeanMarketData(getEuropeanMarketData());
      setLastUpdated(new Date());
    }, refreshInterval);

    return cleanup;
  }, [refreshInterval]);

  // Calculate global market metrics
  const totalMarketCap = usMarketData.reduce((sum, index) => {
    // This is just a mock calculation
    const marketCap = parseFloat(index.value) * (index.symbol === 'SPX' ? 150 : index.symbol === 'NDX' ? 200 : 100);
    return sum + marketCap;
  }, 0);

  const globalPerformance = usMarketData.reduce((sum, index) => {
    return sum + parseFloat(index.percentChange);
  }, 0) / usMarketData.length;

  // Function to force an immediate update
  const refreshData = () => {
    setUsMarketData(getMarketData());
    setAsianMarketData(getAsianMarketData());
    setEuropeanMarketData(getEuropeanMarketData());
    setLastUpdated(new Date());
  };

  return {
    usMarketData,
    asianMarketData,
    europeanMarketData,
    globalMetrics: {
      marketCap: (totalMarketCap / 1000).toFixed(1) + 'T', // Convert to trillions
      performance: globalPerformance.toFixed(2) + '%',
      direction: globalPerformance >= 0 ? 'up' : 'down',
      lastUpdated
    },
    refreshInterval,
    setRefreshInterval,
    refreshData
  };
}
