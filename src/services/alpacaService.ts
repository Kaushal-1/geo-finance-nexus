
import axios from "axios";

const ALPACA_BASE_URL = "https://paper-api.alpaca.markets";
const ALPACA_API_KEY_ID = "PKJ1BKJG3HHOXYNCRLZK";
const ALPACA_API_SECRET_KEY = "l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd";

// Create an axios instance for Alpaca API
const alpacaClient = axios.create({
  baseURL: ALPACA_BASE_URL,
  headers: {
    'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
    'APCA-API-SECRET-KEY': ALPACA_API_SECRET_KEY,
    'Content-Type': 'application/json'
  }
});

// Error handling middleware
alpacaClient.interceptors.response.use(
  response => response,
  error => {
    console.error("Alpaca API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Account information
export const getAccountInfo = async () => {
  try {
    const response = await alpacaClient.get("/v2/account");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch account info:", error);
    return null;
  }
};

// Positions
export const getPositions = async () => {
  try {
    const response = await alpacaClient.get("/v2/positions");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return [];
  }
};

// Orders
export const getOrders = async (status = "all", limit = 50) => {
  try {
    const response = await alpacaClient.get(`/v2/orders?status=${status}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};

// Place order
export const placeOrder = async (orderData) => {
  try {
    const response = await alpacaClient.post("/v2/orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Failed to place order:", error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId) => {
  try {
    await alpacaClient.delete(`/v2/orders/${orderId}`);
    return true;
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw error;
  }
};

// Watchlists
export const getWatchlists = async () => {
  try {
    const response = await alpacaClient.get("/v2/watchlists");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch watchlists:", error);
    return [];
  }
};

// Create watchlist
export const createWatchlist = async (name, symbols) => {
  try {
    const response = await alpacaClient.post("/v2/watchlists", { name, symbols });
    return response.data;
  } catch (error) {
    console.error("Failed to create watchlist:", error);
    throw error;
  }
};

// Add to watchlist
export const addToWatchlist = async (watchlistId, symbol) => {
  try {
    const response = await alpacaClient.post(`/v2/watchlists/${watchlistId}`, { symbol });
    return response.data;
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    throw error;
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (watchlistId, symbol) => {
  try {
    await alpacaClient.delete(`/v2/watchlists/${watchlistId}/${symbol}`);
    return true;
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    throw error;
  }
};

export default {
  getAccountInfo,
  getPositions,
  getOrders,
  placeOrder,
  cancelOrder,
  getWatchlists,
  createWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
