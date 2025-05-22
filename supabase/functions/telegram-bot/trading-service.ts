
// Trading service to handle buy/sell orders via Alpaca API
export class TradingService {
  private API_BASE_URL = 'https://paper-api.alpaca.markets';
  private API_KEY: string;
  private API_SECRET: string;

  constructor() {
    this.API_KEY = Deno.env.get('ALPACA_API_KEY') || 'PKJ1BKJG3HHOXYNCRLZK';
    this.API_SECRET = Deno.env.get('ALPACA_API_SECRET') || 'l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd';

    if (!this.API_KEY || !this.API_SECRET) {
      console.error('❌ Alpaca API credentials are missing!');
    }
  }

  async placeOrder(orderData: {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
    telegram_chat_id: string;
  }) {
    try {
      console.log(`Placing ${orderData.side} order for ${orderData.qty} shares of ${orderData.symbol}`);

      // Construct order payload
      const payload: any = {
        symbol: orderData.symbol,
        qty: orderData.qty.toString(),
        side: orderData.side,
        type: orderData.type,
        time_in_force: orderData.time_in_force,
      };

      // Add optional fields if provided
      if (orderData.limit_price) {
        payload.limit_price = orderData.limit_price.toString();
      }
      if (orderData.stop_price) {
        payload.stop_price = orderData.stop_price.toString();
      }

      // Call Alpaca API
      const response = await fetch(`${this.API_BASE_URL}/v2/orders`, {
        method: 'POST',
        headers: {
          'APCA-API-KEY-ID': this.API_KEY,
          'APCA-API-SECRET-KEY': this.API_SECRET,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Alpaca API Error:', errorData);
        throw new Error(errorData.message || `Order failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Order placed successfully:', data);
      return data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  async getPositions() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/v2/positions`, {
        headers: {
          'APCA-API-KEY-ID': this.API_KEY,
          'APCA-API-SECRET-KEY': this.API_SECRET,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch positions: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting positions:', error);
      throw new Error(`Failed to get positions: ${error.message}`);
    }
  }

  async getOrders(status = 'all', limit = 50) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/v2/orders?status=${status}&limit=${limit}`, {
        headers: {
          'APCA-API-KEY-ID': this.API_KEY,
          'APCA-API-SECRET-KEY': this.API_SECRET,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting orders:', error);
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }
}
