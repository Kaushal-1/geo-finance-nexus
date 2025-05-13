
import { useState, useEffect, useCallback } from "react";
import { alpacaService } from "@/services/alpacaService";
import { AlpacaAccount, AlpacaPosition, AlpacaOrder, PlaceOrderRequest, AlpacaWatchlist } from "@/types/alpaca";
import { toast } from "@/components/ui/use-toast";

export const useTradingData = () => {
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [watchlists, setWatchlists] = useState<AlpacaWatchlist[]>([]);
  
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
  const fetchAccount = useCallback(async () => {
    setIsLoadingAccount(true);
    const accountData = await alpacaService.getAccount();
    if (accountData) {
      setAccount(accountData);
    }
    setIsLoadingAccount(false);
  }, []);
  
  const fetchPositions = useCallback(async () => {
    setIsLoadingPositions(true);
    const positionsData = await alpacaService.getPositions();
    if (positionsData) {
      setPositions(positionsData);
    }
    setIsLoadingPositions(false);
  }, []);
  
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    const ordersData = await alpacaService.getOrders();
    if (ordersData) {
      setOrders(ordersData);
    }
    setIsLoadingOrders(false);
  }, []);
  
  const fetchWatchlists = useCallback(async () => {
    setIsLoadingWatchlists(true);
    const watchlistsData = await alpacaService.getWatchlists();
    if (watchlistsData) {
      setWatchlists(watchlistsData);
    }
    setIsLoadingWatchlists(false);
  }, []);

  // Initial fetch of all data
  useEffect(() => {
    fetchAccount();
    fetchPositions();
    fetchOrders();
    fetchWatchlists();
  }, [fetchAccount, fetchPositions, fetchOrders, fetchWatchlists]);

  // Set up periodic refresh for account and positions
  useEffect(() => {
    const accountPositionsTimer = setInterval(() => {
      fetchAccount();
      fetchPositions();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(accountPositionsTimer);
  }, [fetchAccount, fetchPositions]);

  const handlePlaceOrder = async (orderData: PlaceOrderRequest) => {
    setIsProcessingOrder(true);
    try {
      const result = await alpacaService.placeOrder(orderData);
      if (result) {
        // Refresh data after placing order
        fetchOrders();
        fetchPositions();
        fetchAccount();
        return result;
      }
      return null;
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const result = await alpacaService.cancelOrder(orderId);
    if (result) {
      fetchOrders();
      return true;
    }
    return false;
  };

  const handleRefreshOrders = useCallback(async () => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateWatchlist = async (name: string, symbols: string[]) => {
    const result = await alpacaService.createWatchlist(name, symbols);
    if (result) {
      fetchWatchlists();
      return result;
    }
    return null;
  };

  const handleAddToWatchlist = async (watchlistId: string, symbol: string) => {
    const result = await alpacaService.addToWatchlist(watchlistId, symbol);
    if (result) {
      fetchWatchlists();
      return result;
    }
    return null;
  };

  const handleRemoveFromWatchlist = async (watchlistId: string, symbol: string) => {
    const result = await alpacaService.removeFromWatchlist(watchlistId, symbol);
    if (result) {
      fetchWatchlists();
      return true;
    }
    return false;
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    const result = await alpacaService.deleteWatchlist(watchlistId);
    if (result) {
      fetchWatchlists();
      return true;
    }
    return false;
  };

  const handleRefreshWatchlists = useCallback(async () => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  return {
    account,
    positions,
    orders,
    watchlists,
    isLoadingAccount,
    isLoadingPositions,
    isLoadingOrders,
    isLoadingWatchlists,
    isProcessingOrder,
    placeOrder: handlePlaceOrder,
    cancelOrder: handleCancelOrder,
    refreshOrders: handleRefreshOrders,
    createWatchlist: handleCreateWatchlist,
    addToWatchlist: handleAddToWatchlist,
    removeFromWatchlist: handleRemoveFromWatchlist,
    deleteWatchlist: handleDeleteWatchlist,
    refreshWatchlists: handleRefreshWatchlists,
    refreshAll: useCallback(async () => {
      fetchAccount();
      fetchPositions();
      fetchOrders();
      fetchWatchlists();
    }, [fetchAccount, fetchPositions, fetchOrders, fetchWatchlists]),
  };
};
