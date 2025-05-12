
import { useState, useEffect } from 'react';
import { 
  getMarketData, 
  getAsianMarketData, 
  getEuropeanMarketData, 
  startMarketDataUpdates, 
  FormattedMarketData 
} from '@/services/marketService';
import { useToast } from '@/components/ui/use-toast';

export function useMarketData() {
  const [usMarketData, setUsMarketData] = useState<FormattedMarketData[]>([]);
  const [asianMarketData, setAsianMarketData] = useState<FormattedMarketData[]>([]);
  const [europeanMarketData, setEuropeanMarketData] = useState<FormattedMarketData[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(120000); // Increased to 2 minutes
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const updateMarkets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get US data first
        const usData = await getMarketData();
        if (usData && usData.length > 0) {
          setUsMarketData(usData);
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get Asian data
        const asianData = await getAsianMarketData();
        if (asianData && asianData.length > 0) {
          setAsianMarketData(asianData);
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get European data
        const europeanData = await getEuropeanMarketData();
        if (europeanData && europeanData.length > 0) {
          setEuropeanMarketData(europeanData);
        }
        
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch market data:", err);
        setError(`Unable to fetch real-time market data: ${err.message || 'Unknown error'}`);
        toast({
          title: "Data Fetch Notice",
          description: "Using simulated market data due to API limitations.",
          variant: "default",
        });
        setIsLoading(false);
      }
    };

    // Initial update
    updateMarkets();

    // Set up interval for updates with longer interval to avoid rate limiting
    const intervalId = setInterval(updateMarkets, refreshInterval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Calculate global market metrics from whatever data we have
  const totalMarketCap = [...usMarketData, ...asianMarketData, ...europeanMarketData].reduce((sum, index) => {
    // This is just an approximation based on current value
    const marketCap = parseFloat(index.value) * (index.symbol === 'SPX' ? 150 : index.symbol === 'NDX' ? 200 : 100);
    return sum + marketCap;
  }, 0);

  const allMarkets = [...usMarketData, ...asianMarketData, ...europeanMarketData];
  const globalPerformance = allMarkets.length > 0 
    ? allMarkets.reduce((sum, index) => sum + parseFloat(index.percentChange), 0) / allMarkets.length
    : 0;

  // Function to force an immediate update
  const refreshData = async () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest market data...",
    });
    
    setIsLoading(true);
    
    try {
      // Get US data first
      const usData = await getMarketData();
      if (usData && usData.length > 0) {
        setUsMarketData(usData);
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get Asian data
      const asianData = await getAsianMarketData();
      if (asianData && asianData.length > 0) {
        setAsianMarketData(asianData);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get European data
      const europeanData = await getEuropeanMarketData();
      if (europeanData && europeanData.length > 0) {
        setEuropeanMarketData(europeanData);
      }
      
      setLastUpdated(new Date());
      setIsLoading(false);
      
      toast({
        title: "Data Refreshed",
        description: "Market data has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Failed to refresh data:", err);
      toast({
        title: "Data Refresh Notice",
        description: "Using simulated market data due to API limitations.",
        variant: "default",
      });
      setIsLoading(false);
    }
  };

  return {
    usMarketData,
    asianMarketData,
    europeanMarketData,
    isLoading,
    error,
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
