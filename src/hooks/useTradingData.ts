
import { useState, useEffect, useCallback } from "react";
import { alpacaService } from "@/services/alpacaService";
import { AlpacaAccount, AlpacaPosition, AlpacaOrder, PlaceOrderRequest, AlpacaWatchlist } from "@/types/alpaca";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    console.log("Fetching watchlists in hook...");
    setIsLoadingWatchlists(true);
    try {
      const watchlistsData = await alpacaService.getWatchlists();
      console.log("Watchlists data received in hook:", watchlistsData);
      if (watchlistsData) {
        // For each watchlist, fetch its details to get the assets
        const watchlistsWithDetails = await Promise.all(
          watchlistsData.map(async (watchlist: AlpacaWatchlist) => {
            const details = await alpacaService.getWatchlist(watchlist.id);
            return details || watchlist;
          })
        );
        console.log("Watchlists with details:", watchlistsWithDetails);
        setWatchlists(watchlistsWithDetails);
      } else {
        setWatchlists([]);
      }
    } catch (error) {
      console.error("Error in fetchWatchlists:", error);
      toast({
        title: "Error",
        description: "Failed to fetch watchlists. Please try again.",
        duration: 5000,
      });
      setWatchlists([]);
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
        
        // If this order is linked to Telegram, notify
        if (orderData.telegram_chat_id) {
          await notifyTelegramOrderPlaced(orderData.telegram_chat_id, result.id, orderData.symbol, orderData.qty, orderData.side);
        }
        
        return result;
      }
      return null;
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const notifyTelegramOrderPlaced = async (chatId: string, orderId: string, symbol: string, qty: number, side: string) => {
    try {
      // Here we would call our Telegram notification service
      console.log(`Would notify Telegram chat ${chatId} about ${side} order for ${qty} shares of ${symbol}, order ID: ${orderId}`);
      // This is a placeholder - in production, you would call your edge function here
    } catch (error) {
      console.error("Error notifying Telegram about order:", error);
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

  const handleCreateWatchlist = async (name: string, symbols: string[] = []) => {
    console.log(`Creating watchlist "${name}" with symbols:`, symbols);
    try {
      const result = await alpacaService.createWatchlist(name, symbols);
      console.log("Create watchlist result:", result);
      if (result) {
        await fetchWatchlists();
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error in handleCreateWatchlist:", error);
      return null;
    }
  };

  const handleAddToWatchlist = async (watchlistId: string, symbol: string) => {
    console.log(`Adding ${symbol} to watchlist ${watchlistId}`);
    try {
      const result = await alpacaService.addToWatchlist(watchlistId, symbol);
      console.log("Add to watchlist result:", result);
      if (result) {
        await fetchWatchlists();
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error in handleAddToWatchlist:", error);
      return null;
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId: string, symbol: string) => {
    console.log(`Removing ${symbol} from watchlist ${watchlistId}`);
    try {
      const result = await alpacaService.removeFromWatchlist(watchlistId, symbol);
      console.log("Remove from watchlist result:", result);
      if (result) {
        await fetchWatchlists();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleRemoveFromWatchlist:", error);
      return false;
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    console.log(`Deleting watchlist ${watchlistId}`);
    try {
      const result = await alpacaService.deleteWatchlist(watchlistId);
      console.log("Delete watchlist result:", result);
      if (result) {
        await fetchWatchlists();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleDeleteWatchlist:", error);
      return false;
    }
  };

  const handleRefreshWatchlists = useCallback(async () => {
    console.log("Manual refresh of watchlists requested");
    await fetchWatchlists();
  }, [fetchWatchlists]);

  // New function to create a price alert
  const handleCreatePriceAlert = async (symbol: string, condition: 'price_above' | 'price_below', threshold: number, telegramChatId?: string) => {
    try {
      // Create alert in the database
      const { data, error } = await supabase
        .from('price_alerts')
        .insert([
          {
            symbol,
            condition,
            threshold,
            telegram_chat_id: telegramChatId || null,
            created_at: new Date().toISOString(),
            active: true
          }
        ])
        .select();

      if (error) {
        console.error("Error creating price alert:", error);
        toast({
          title: "Error",
          description: "Failed to create price alert. Please try again.",
          duration: 5000,
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Alert Created",
        description: `Alert created for ${symbol} when price goes ${condition === 'price_above' ? 'above' : 'below'} $${threshold}`,
        duration: 3000,
      });

      return data[0];
    } catch (error) {
      console.error("Error creating price alert:", error);
      toast({
        title: "Error",
        description: "Failed to create price alert. Please try again.",
        duration: 5000,
        variant: "destructive"
      });
      return null;
    }
  };

  // New function to list price alerts
  const handleGetPriceAlerts = async (telegramChatId?: string) => {
    try {
      let query = supabase
        .from('price_alerts')
        .select('*')
        .eq('active', true);
        
      // If telegramChatId is provided, filter by it
      if (telegramChatId) {
        query = query.eq('telegram_chat_id', telegramChatId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching price alerts:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      return [];
    }
  };

  // New function to delete price alert
  const handleDeletePriceAlert = async (alertId: string, telegramChatId?: string) => {
    try {
      let query = supabase
        .from('price_alerts')
        .delete();
        
      // Basic condition
      query = query.eq('id', alertId);
      
      // If telegramChatId is provided, add it as an additional condition
      if (telegramChatId) {
        query = query.eq('telegram_chat_id', telegramChatId);
      }
      
      const { error } = await query;

      if (error) {
        console.error("Error deleting price alert:", error);
        toast({
          title: "Error",
          description: "Failed to delete price alert. Please try again.",
          duration: 5000,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Alert Deleted",
        description: "Price alert has been deleted successfully.",
        duration: 3000,
      });

      return true;
    } catch (error) {
      console.error("Error deleting price alert:", error);
      toast({
        title: "Error",
        description: "Failed to delete price alert. Please try again.",
        duration: 5000,
        variant: "destructive"
      });
      return false;
    }
  };

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
    createPriceAlert: handleCreatePriceAlert,
    getPriceAlerts: handleGetPriceAlerts, 
    deletePriceAlert: handleDeletePriceAlert,
    refreshAll: useCallback(async () => {
      fetchAccount();
      fetchPositions();
      fetchOrders();
      fetchWatchlists();
    }, [fetchAccount, fetchPositions, fetchOrders, fetchWatchlists]),
  };
};
