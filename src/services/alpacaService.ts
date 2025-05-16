
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

// Market data API - separate endpoint for bars data
const alpacaDataApi = axios.create({
  baseURL: 'https://data.alpaca.markets',
  headers: {
    'APCA-API-KEY-ID': 'PKJ1BKJG3HHOXYNCRLZK',
    'APCA-API-SECRET-KEY': 'l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd',
    'Content-Type': 'application/json'
  }
});

// Telegram bot API key for market notifications
const TELEGRAM_BOT_API_KEY = '7594960846:AAECYafwv1rQ1oq-ZkLR6PZWvC9CBtQUZnY';

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

// Create WebSocket connection for real-time data
let stockDataWebSocket: WebSocket | null = null;
const stockDataCallbacks: Map<string, (data: any) => void> = new Map();

const connectWebSocket = () => {
  if (stockDataWebSocket && stockDataWebSocket.readyState === WebSocket.OPEN) {
    return stockDataWebSocket;
  }
  
  const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
    // Authenticate
    ws.send(JSON.stringify({
      action: 'auth',
      key: 'PKJ1BKJG3HHOXYNCRLZK',
      secret: 'l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd'
    }));
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle authentication response
      if (data[0] && data[0].T === 'success' && data[0].msg === 'authenticated') {
        console.log('WebSocket authenticated successfully');
        
        // Subscribe to symbols if any callbacks are registered
        if (stockDataCallbacks.size > 0) {
          const symbols = Array.from(stockDataCallbacks.keys());
          subscribeToSymbols(symbols);
        }
        return;
      }
      
      // Handle trade updates
      if (data[0] && (data[0].T === 'q' || data[0].T === 't')) {
        // 'q' for quotes, 't' for trades
        const symbol = data[0].S;
        const callback = stockDataCallbacks.get(symbol);
        if (callback) {
          callback(data[0]);
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    toast({
      title: "WebSocket Error",
      description: "Connection to real-time data feed failed. Retrying...",
      duration: 5000,
    });
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed. Reconnecting...');
    setTimeout(() => {
      stockDataWebSocket = connectWebSocket();
    }, 5000);
  };
  
  stockDataWebSocket = ws;
  return ws;
};

const subscribeToSymbols = (symbols: string[]) => {
  if (!stockDataWebSocket || stockDataWebSocket.readyState !== WebSocket.OPEN) {
    connectWebSocket();
    return;
  }
  
  // Subscribe to trades for the symbols
  stockDataWebSocket.send(JSON.stringify({
    action: 'subscribe',
    trades: symbols,
    quotes: symbols,
    bars: symbols
  }));
  
  console.log(`Subscribed to real-time data for: ${symbols.join(', ')}`);
};

const unsubscribeFromSymbols = (symbols: string[]) => {
  if (!stockDataWebSocket || stockDataWebSocket.readyState !== WebSocket.OPEN) {
    return;
  }
  
  stockDataWebSocket.send(JSON.stringify({
    action: 'unsubscribe',
    trades: symbols,
    quotes: symbols,
    bars: symbols
  }));
  
  console.log(`Unsubscribed from real-time data for: ${symbols.join(', ')}`);
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
        case '1Min':
          apiTimeframe = '1Min';
          startDate = new Date(today.setMinutes(today.getMinutes() - 120)).toISOString();
          break;
        case '5Min':
          apiTimeframe = '5Min';
          startDate = new Date(today.setMinutes(today.getMinutes() - 5 * 120)).toISOString();
          break;
        case '15Min':
          apiTimeframe = '15Min';
          startDate = new Date(today.setMinutes(today.getMinutes() - 15 * 100)).toISOString();
          break;
        case '1Hour':
          apiTimeframe = '1Hour';
          startDate = new Date(today.setHours(today.getHours() - 72)).toISOString();
          break;
        case '1Day':
          // For 1-day view, use 5-minute bars for the current day
          apiTimeframe = '1Day';
          startDate = new Date(today.setDate(today.getDate() - 30)).toISOString();
          break;
        case '1Week':
          // For 1-week view, use 1-hour bars
          apiTimeframe = '1Week';
          startDate = new Date(today.setDate(today.getDate() - 7 * 52)).toISOString();
          break;
        case '1Month':
          // For 1-month view, use 1-day bars
          apiTimeframe = '1Month';
          startDate = new Date(today.setMonth(today.getMonth() - 24)).toISOString();
          break;
        default:
          apiTimeframe = timeframe;
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
  },

  // Real-time WebSocket methods
  subscribeToRealTimeData: (symbol: string, callback: (data: any) => void) => {
    console.log(`Setting up real-time subscription for ${symbol}`);
    
    // Store the callback
    stockDataCallbacks.set(symbol, callback);
    
    // Connect WebSocket if not already connected
    if (!stockDataWebSocket || stockDataWebSocket.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    } else {
      // If already connected, subscribe to this symbol
      subscribeToSymbols([symbol]);
    }
    
    return () => {
      console.log(`Cleaning up real-time subscription for ${symbol}`);
      stockDataCallbacks.delete(symbol);
      unsubscribeFromSymbols([symbol]);
    };
  },
  
  // Get last quote for a symbol
  getLastQuote: async (symbol: string) => {
    try {
      const response = await alpacaDataApi.get(`/v2/stocks/${symbol}/quotes/latest`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch last quote for ${symbol}`);
    }
  },
  
  // Get last trade for a symbol
  getLastTrade: async (symbol: string) => {
    try {
      const response = await alpacaDataApi.get(`/v2/stocks/${symbol}/trades/latest`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch last trade for ${symbol}`);
    }
  },
  
  // Send a Telegram notification
  sendTelegramNotification: async (chatId: string, message: string) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_API_KEY}/sendMessage`;
      const response = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return null;
    }
  }
};
