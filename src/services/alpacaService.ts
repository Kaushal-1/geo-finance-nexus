
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Create an axios instance with base URL and auth headers
const alpacaApi = axios.create({
  baseURL: 'https://paper-api.alpaca.markets',
  headers: {
    'APCA-API-KEY-ID': 'PKJ1BKJG3HHOXYNCRLZK',
    'APCA-API-SECRET-KEY': 'l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd',
    'Content-Type': 'application/json'
  }
});

// Error handler for API requests
const handleApiError = (error: any, message: string) => {
  console.error(`${message}:`, error);
  toast({
    title: "API Error",
    description: `${message}: ${error.response?.data?.message || error.message}`,
    duration: 5000,
  });
  return null;
};

// API functions
export const alpacaService = {
  // Get account information
  getAccount: async () => {
    try {
      const response = await alpacaApi.get('/v2/account');
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch account data");
    }
  },

  // Get all open positions
  getPositions: async () => {
    try {
      const response = await alpacaApi.get('/v2/positions');
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch positions");
    }
  },

  // Get recent orders
  getOrders: async (status = 'all', limit = 50) => {
    try {
      const response = await alpacaApi.get(`/v2/orders?status=${status}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch orders");
    }
  },

  // Place a new order
  placeOrder: async (orderData: any) => {
    try {
      const response = await alpacaApi.post('/v2/orders', orderData);
      toast({
        title: "Order Placed",
        description: `${orderData.side.toUpperCase()} order for ${orderData.qty} ${orderData.symbol} submitted successfully.`,
        duration: 3000,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to place order");
    }
  },

  // Cancel an order
  cancelOrder: async (orderId: string) => {
    try {
      await alpacaApi.delete(`/v2/orders/${orderId}`);
      toast({
        title: "Order Cancelled",
        description: `Order ${orderId} has been cancelled.`,
        duration: 3000,
      });
      return true;
    } catch (error) {
      return handleApiError(error, "Failed to cancel order");
    }
  },

  // Get all watchlists
  getWatchlists: async () => {
    try {
      const response = await alpacaApi.get('/v2/watchlists');
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch watchlists");
    }
  },

  // Create a new watchlist
  createWatchlist: async (name: string, symbols: string[]) => {
    try {
      const response = await alpacaApi.post('/v2/watchlists', { name, symbols });
      toast({
        title: "Watchlist Created",
        description: `Watchlist "${name}" has been created.`,
        duration: 3000,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to create watchlist");
    }
  },

  // Add a symbol to a watchlist
  addToWatchlist: async (watchlistId: string, symbol: string) => {
    try {
      const response = await alpacaApi.post(`/v2/watchlists/${watchlistId}`, { symbol });
      toast({
        title: "Symbol Added",
        description: `${symbol} added to watchlist.`,
        duration: 3000,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to add symbol to watchlist");
    }
  },

  // Remove a symbol from a watchlist
  removeFromWatchlist: async (watchlistId: string, symbol: string) => {
    try {
      await alpacaApi.delete(`/v2/watchlists/${watchlistId}/${symbol}`);
      toast({
        title: "Symbol Removed",
        description: `${symbol} removed from watchlist.`,
        duration: 3000,
      });
      return true;
    } catch (error) {
      return handleApiError(error, "Failed to remove symbol from watchlist");
    }
  },

  // Delete a watchlist
  deleteWatchlist: async (watchlistId: string) => {
    try {
      await alpacaApi.delete(`/v2/watchlists/${watchlistId}`);
      toast({
        title: "Watchlist Deleted",
        description: "Watchlist has been deleted.",
        duration: 3000,
      });
      return true;
    } catch (error) {
      return handleApiError(error, "Failed to delete watchlist");
    }
  }
};
