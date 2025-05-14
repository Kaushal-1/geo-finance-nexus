
import { useState, useEffect, useCallback } from "react";
import { alpacaService } from "@/services/alpacaService";
import { AlpacaAccount, AlpacaPosition, AlpacaOrder } from "@/types/alpaca";

export const usePortfolioContext = () => {
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all portfolio data in parallel
      const [accountData, positionsData, ordersData, portfolioHistoryData] = await Promise.all([
        alpacaService.getAccount(),
        alpacaService.getPositions(),
        alpacaService.getOrders('all', 20),
        alpacaService.getPortfolioHistory()
      ]);
      
      setAccount(accountData);
      setPositions(positionsData || []);
      setOrders(ordersData || []);
      setPortfolioHistory(portfolioHistoryData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setError("Failed to load portfolio data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize portfolio data when hook is first used
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Format portfolio summary for context
  const getPortfolioSummary = useCallback(() => {
    if (!account || positions.length === 0) return null;
    
    const totalEquity = parseFloat(account.equity);
    const totalPositions = positions.length;
    
    // Calculate sector exposure (simplified)
    const sectors: Record<string, number> = {};
    let largestPosition = { symbol: '', value: 0 };
    
    positions.forEach(position => {
      const value = parseFloat(position.market_value);
      
      // Determine simple sectors based on symbols (in a real app, would use actual sector data)
      let sector = 'Other';
      if (['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN'].includes(position.symbol)) sector = 'Technology';
      if (['JPM', 'BAC', 'WFC', 'GS'].includes(position.symbol)) sector = 'Financial';
      if (['JNJ', 'PFE', 'UNH'].includes(position.symbol)) sector = 'Healthcare';
      
      sectors[sector] = (sectors[sector] || 0) + value;
      
      if (value > largestPosition.value) {
        largestPosition = { symbol: position.symbol, value };
      }
    });
    
    // Calculate portfolio change
    const portfolioChange = account.equity && account.last_equity 
      ? ((parseFloat(account.equity) / parseFloat(account.last_equity)) - 1) * 100 
      : 0;
    
    return {
      totalEquity,
      totalPositions,
      portfolioChange: portfolioChange.toFixed(2),
      largestPosition: largestPosition.symbol,
      sectors
    };
  }, [account, positions]);

  return {
    account,
    positions,
    orders,
    portfolioHistory,
    isLoading,
    error,
    lastRefreshed,
    refreshData: fetchPortfolioData,
    portfolioSummary: getPortfolioSummary()
  };
};
