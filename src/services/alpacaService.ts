import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Create an axios instance with base URL and auth headers
const alpacaApi = axios.create({
  baseURL: 'https://paper-api.alpaca.markets',
  headers: {
    'APCA-API-KEY-ID': import.meta.env.VITE_ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': import.meta.env.VITE_ALPACA_API_SECRET,
    'Content-Type': 'application/json'
  }
});

// Market data API - separate endpoint for bars data
const alpacaDataApi = axios.create({
  baseURL: 'https://data.alpaca.markets',
  headers: {
    'APCA-API-KEY-ID': import.meta.env.VITE_ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': import.meta.env.VITE_ALPACA_API_SECRET,
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
      console.log("Fetching watchlists...");
      const response = await alpacaApi.get('/v2/watchlists');
      console.log("Watchlists response:", response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch watchlists");
    }
  },

  // Get a specific watchlist by ID
  getWatchlist: async (watchlistId: string) => {
    try {
      console.log(`Fetching watchlist ${watchlistId}...`);
      const response = await alpacaApi.get(`/v2/watchlists/${watchlistId}`);
      console.log("Watchlist response:", response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch watchlist details");
    }
  },

  // Create a new watchlist
  createWatchlist: async (name: string, symbols: string[] = []) => {
    try {
      console.log(`Creating watchlist "${name}" with symbols:`, symbols);
      const response = await alpacaApi.post('/v2/watchlists', { name, symbols });
      console.log("Create watchlist response:", response.data);
      
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
      console.log(`Adding ${symbol} to watchlist ${watchlistId}`);
      const response = await alpacaApi.post(`/v2/watchlists/${watchlistId}`, { symbol });
      console.log("Add to watchlist response:", response.data);
      
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
      console.log(`Removing ${symbol} from watchlist ${watchlistId}`);
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
      console.log(`Deleting watchlist ${watchlistId}`);
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
  },
  
  // Get bars (candles) for a symbol
  getBars: async (symbol: string, timeframe = '1Day', limit = 60) => {
    console.log(`Getting bars for ${symbol} with timeframe ${timeframe}, limit ${limit}`);
    try {
      // Map user-friendly timeframes to API format
      let apiTimeframe: string;
      const today = new Date();
      let startDate: string | null = null;
      
      // Determine appropriate parameters based on timeframe
      switch (timeframe) {
        case '1Day':
          // For 1-day view, use 5-minute bars for the current day
          apiTimeframe = '5Min';
          startDate = new Date(today.setHours(0,0,0,0)).toISOString();
          break;
        case '5Day':
          // For 5-day view, use 1-hour bars
          apiTimeframe = '1Hour';
          startDate = new Date(today.setDate(today.getDate() - 5)).toISOString();
          break;
        case '1Week':
          // For 1-week view, use 1-hour bars
          apiTimeframe = '1Hour';
          startDate = new Date(today.setDate(today.getDate() - 7)).toISOString();
          break;
        case '1Month':
          // For 1-month view, use 1-day bars
          apiTimeframe = '1Day';
          startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString();
          break;
        default:
          apiTimeframe = '1Day';
      }
      
      // Construct request parameters
      const params: any = {
        timeframe: apiTimeframe,
        adjustment: 'all',
      };
      
      // Use either start_date or limit depending on timeframe
      if (startDate) {
        params.start = startDate;
      } else {
        params.limit = limit;
      }
      
      const response = await alpacaDataApi.get(`/v2/stocks/${symbol}/bars`, { params });
      
      if (response.data && response.data.bars) {
        console.log(`Received ${response.data.bars.length} bars for ${symbol} with timeframe ${apiTimeframe}`);
        // Ensure we're returning sorted bars with correct property types
        return response.data.bars.map((bar: any) => ({
          t: bar.t,  // Keep timestamp as string
          o: parseFloat(bar.o),
          h: parseFloat(bar.h),
          l: parseFloat(bar.l),
          c: parseFloat(bar.c),
          v: parseFloat(bar.v),
        }));
      } else {
        console.warn("Empty or invalid bars data received:", response.data);
        return [];
      }
    } catch (error) {
      return handleApiError(error, `Failed to fetch stock data for ${symbol}`);
    }
  },
  
  // Search for assets
  searchAssets: async (query: string) => {
    console.log(`Searching assets matching "${query}"`);
    try {
      const response = await alpacaApi.get('/v2/assets', {
        params: {
          status: 'active',
          asset_class: 'us_equity'
        }
      });
      
      // Filter the assets by query
      const matches = response.data
        .filter((asset: any) => 
          asset.symbol.includes(query.toUpperCase()) || 
          (asset.name && asset.name.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 10);
      
      return matches;
    } catch (error) {
      return handleApiError(error, "Failed to search assets");
    }
  },
  
  // Get portfolio history
  getPortfolioHistory: async (period = '1M', timeframe = '1D') => {
    try {
      const response = await alpacaApi.get(`/v2/account/portfolio/history?period=${period}&timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch portfolio history");
    }
  }
};
