
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
  const [refreshInterval, setRefreshInterval] = useState<number>(15000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const updateMarkets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [usData, asianData, europeanData] = await Promise.all([
          getMarketData(),
          getAsianMarketData(),
          getEuropeanMarketData()
        ]);
        
        setUsMarketData(usData);
        setAsianMarketData(asianData);
        setEuropeanMarketData(europeanData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Failed to fetch market data:", err);
        setError("Unable to fetch market data. Using fallback data.");
        toast({
          title: "Data Fetch Error",
          description: "Could not fetch real-time market data. Using fallback data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial update
    updateMarkets();

    // Set up interval for updates
    const cleanup = startMarketDataUpdates(async (data) => {
      setUsMarketData(data);
      try {
        const [asianData, europeanData] = await Promise.all([
          getAsianMarketData(),
          getEuropeanMarketData()
        ]);
        setAsianMarketData(asianData);
        setEuropeanMarketData(europeanData);
      } catch (error) {
        console.error("Error in interval update:", error);
      }
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
  }, 0) / (usMarketData.length || 1); // Avoid division by zero

  // Function to force an immediate update
  const refreshData = async () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest market data...",
    });
    
    try {
      setIsLoading(true);
      const [usData, asianData, europeanData] = await Promise.all([
        getMarketData(),
        getAsianMarketData(),
        getEuropeanMarketData()
      ]);
      
      setUsMarketData(usData);
      setAsianMarketData(asianData);
      setEuropeanMarketData(europeanData);
      setLastUpdated(new Date());
      
      toast({
        title: "Data Refreshed",
        description: "Market data has been updated successfully.",
      });
    } catch (err) {
      console.error("Failed to refresh data:", err);
      toast({
        title: "Refresh Failed",
        description: "Could not fetch the latest market data.",
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
