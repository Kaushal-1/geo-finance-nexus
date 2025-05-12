
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
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // Increased to 1 minute to reduce API calls
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
        setUsMarketData(usData);
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get Asian data
        const asianData = await getAsianMarketData();
        setAsianMarketData(asianData);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get European data
        const europeanData = await getEuropeanMarketData();
        setEuropeanMarketData(europeanData);
        
        setLastUpdated(new Date());
        toast({
          title: "Market Data Updated",
          description: "Latest market data has been fetched successfully.",
        });
      } catch (err: any) {
        console.error("Failed to fetch market data:", err);
        setError(`Unable to fetch real-time market data: ${err.message || 'Unknown error'}`);
        toast({
          title: "Data Fetch Error",
          description: err.message || "Could not fetch real-time market data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial update
    updateMarkets();

    // Set up interval for updates with longer interval to avoid rate limiting
    const cleanup = startMarketDataUpdates(async (data) => {
      setUsMarketData(data);
      setLastUpdated(new Date());
      
      // Update other markets less frequently to avoid rate limits
      try {
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Alternate between Asian and European markets on updates
        const updateTime = new Date().getTime();
        if (updateTime % (2 * refreshInterval) < refreshInterval) {
          const asianData = await getAsianMarketData();
          setAsianMarketData(asianData);
        } else {
          const europeanData = await getEuropeanMarketData();
          setEuropeanMarketData(europeanData);
        }
      } catch (error) {
        console.error("Error in interval update:", error);
      }
    }, refreshInterval);

    return cleanup;
  }, [refreshInterval]);

  // Calculate global market metrics
  const totalMarketCap = usMarketData.reduce((sum, index) => {
    // This is just an approximation based on current value
    const marketCap = parseFloat(index.value) * (index.symbol === 'SPX' ? 150 : index.symbol === 'NDX' ? 200 : 100);
    return sum + marketCap;
  }, 0);

  const globalPerformance = usMarketData.reduce((sum, index) => {
    return sum + parseFloat(index.percentChange);
  }, 0) / (usMarketData.length || 1); // Avoid division by zero

  // Function to force an immediate update
  const refreshData = async () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest real-time market data...",
    });
    
    try {
      setIsLoading(true);
      
      // Get US data first
      const usData = await getMarketData();
      setUsMarketData(usData);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get Asian data
      const asianData = await getAsianMarketData();
      setAsianMarketData(asianData);
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get European data
      const europeanData = await getEuropeanMarketData();
      setEuropeanMarketData(europeanData);
      
      setLastUpdated(new Date());
      
      toast({
        title: "Data Refreshed",
        description: "Real-time market data has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Failed to refresh data:", err);
      toast({
        title: "Refresh Failed",
        description: err.message || "Could not fetch the latest market data.",
        variant: "destructive",
      });
    } finally {
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
