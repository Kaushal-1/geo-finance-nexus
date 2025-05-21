import { TradingService } from "./trading-service.ts";
import { AlertService } from "./alert-service.ts";

// Specify allowed user ID
const ALLOWED_USER_ID = "2085478565";

// In-memory storage for settings (this would be better with a persistent store)
const userSettings: Map<string, any> = new Map();

export class TelegramBot {
  private tradingService: TradingService;
  private alertService: AlertService;
  private BOT_TOKEN: string;
  private SONAR_API_KEY: string;

  constructor(tradingService: TradingService, alertService: AlertService) {
    this.tradingService = tradingService;
    this.alertService = alertService;
    this.BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    this.SONAR_API_KEY = Deno.env.get('PERPLEXITY_API_KEY') || '';
    
    if (!this.BOT_TOKEN) {
      console.error('❌ Telegram BOT_TOKEN is missing!');
    }
    
    if (!this.SONAR_API_KEY) {
      console.error('❌ Sonar API key is missing!');
    }
    
    // Initialize default settings for the allowed user
    if (!userSettings.has(ALLOWED_USER_ID)) {
      userSettings.set(ALLOWED_USER_ID, {
        price_alerts: true,
        order_notifications: true,
        trade_commands: true,
        chat_commands: true,
        updated_at: new Date().toISOString()
      });
    }
  }

  async processUpdate(update: any): Promise<void> {
    // Check if this is a message
    if (!update.message) {
      return;
    }

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || '';

    console.log(`Received message from chat ${chatId}: ${text}`);

    // Verify user is authorized
    if (chatId.toString() !== ALLOWED_USER_ID) {
      console.log(`Unauthorized access attempt from chat ID: ${chatId}`);
      return;
    }

    // Check user settings before processing commands
    const canProcessCommands = await this.checkUserPermissions(chatId.toString(), text);
    if (!canProcessCommands) {
      if (text.startsWith('/')) {
        await this.sendMessage(chatId, "This command has been disabled in your settings. You can enable it in the Trading Dashboard.");
      }
      return;
    }

    // Process commands
    if (text.startsWith('/')) {
      await this.processCommand(chatId, text);
    } else {
      // For non-commands, send helpful message
      await this.sendMessage(chatId, "Send /help to see available commands.");
    }
  }

  async checkUserPermissions(chatId: string, command: string): Promise<boolean> {
    try {
      // Get settings from in-memory storage
      const settings = userSettings.get(chatId);
      
      if (!settings) {
        // If no settings found, default to allowing all
        console.log(`No settings found for user ${chatId}, using defaults`);
        return true;
      }
      
      // Check specific permissions based on command type
      if (command.startsWith('/buy') || command.startsWith('/sell')) {
        return settings.trade_commands;
      } else if (command.startsWith('/alert')) {
        return settings.price_alerts;
      } else if (command.startsWith('/chat')) {
        return settings.chat_commands;
      }
      
      // Default commands like /help are always allowed
      return true;
    } catch (error) {
      console.error("Error checking user permissions:", error);
      // Default to allow in case of error to prevent lockouts
      return true;
    }
  }

  // New method to update settings
  async updateSettings(chatId: string, settings: any): Promise<boolean> {
    try {
      if (chatId !== ALLOWED_USER_ID) {
        throw new Error("Unauthorized user ID");
      }
      
      // Update settings in memory
      const currentSettings = userSettings.get(chatId) || {};
      userSettings.set(chatId, {
        ...currentSettings,
        ...settings,
        updated_at: new Date().toISOString()
      });
      
      console.log(`Updated settings for user ${chatId}:`, userSettings.get(chatId));
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  // Method to get settings
  async getSettings(chatId: string): Promise<any> {
    // Only allow for the specific user ID
    if (chatId !== ALLOWED_USER_ID) {
      throw new Error("Unauthorized user ID");
    }
    
    // Return settings from in-memory storage
    return userSettings.get(chatId) || {
      price_alerts: true,
      order_notifications: true,
      trade_commands: true,
      chat_commands: true,
      updated_at: new Date().toISOString()
    };
  }

  async sendPriceAlert(chatId: string, symbol: string, currentPrice: number, thresholdPrice: number, direction: string): Promise<void> {
    // Verify user is authorized
    if (chatId !== ALLOWED_USER_ID) {
      console.log(`Attempted to send price alert to unauthorized user: ${chatId}`);
      return;
    }

    try {
      // Check if user has price alerts enabled
      const settings = userSettings.get(chatId);
      if (settings && !settings.price_alerts) {
        console.log(`Price alerts disabled for user ${chatId}, not sending notification`);
        return;
      }
      
      const emoji = direction === 'above' ? '📈' : '📉';
      const message = `
${emoji} <b>Stock Price Alert</b>

💹 <b>Symbol:</b> ${symbol}
📊 <b>Current Price:</b> $${Number(currentPrice).toFixed(2)}
🎯 <b>Target Threshold:</b> $${Number(thresholdPrice).toFixed(2)}
🕰️ <b>Status:</b> Price is ${direction} the threshold.

🔍 <a href="https://www.tradingview.com/symbols/${symbol}/">View on TradingView</a>
`;

      await this.sendMessage(parseInt(chatId, 10), message);
    } catch (error) {
      console.error("Error sending price alert:", error);
    }
  }

  async processCommand(chatId: number, commandText: string): Promise<void> {
    const parts = commandText.split(' ');
    const command = parts[0].toLowerCase();

    try {
      switch (command) {
        case '/start':
        case '/help':
          await this.handleHelpCommand(chatId);
          break;
        case '/buy':
          await this.handleBuyCommand(chatId, parts);
          break;
        case '/sell':
          await this.handleSellCommand(chatId, parts);
          break;
        case '/alert':
          await this.handleAlertCommand(chatId, parts);
          break;
        case '/chat':
          await this.handleChatCommand(chatId, parts);
          break;
        default:
          await this.sendMessage(chatId, "Unknown command. Send /help to see available commands.");
      }
    } catch (error) {
      console.error(`Error processing command ${command}:`, error);
      await this.sendMessage(chatId, `Error: ${error.message}`);
    }
  }

  async handleHelpCommand(chatId: number): Promise<void> {
    const helpText = `
<b>NeuroTicker Trading Bot</b>

Available commands:

<b>Trading:</b>
/buy SYMBOL QUANTITY [LIMIT_PRICE] - Buy a stock
/sell SYMBOL QUANTITY [LIMIT_PRICE] - Sell a stock

<b>Alerts:</b>
/alert create SYMBOL CONDITION VALUE - Create price alert
/alert list - List your active alerts
/alert delete ALERT_ID - Delete an alert

<b>AI Assistant:</b>
/chat YOUR_QUESTION - Chat with AI about finance & markets

Examples:
/buy AAPL 10 150
/sell TSLA 5
/alert create AAPL price_below 140
/chat What's the outlook for tech stocks?
`;
    await this.sendMessage(chatId, helpText);
  }

  async handleBuyCommand(chatId: number, parts: string[]): Promise<void> {
    // Expected format: /buy SYMBOL QUANTITY [LIMIT_PRICE]
    if (parts.length < 3) {
      await this.sendMessage(chatId, "Usage: /buy SYMBOL QUANTITY [LIMIT_PRICE]");
      return;
    }

    const symbol = parts[1].toUpperCase();
    const quantity = parseInt(parts[2], 10);
    const limitPrice = parts.length > 3 ? parseFloat(parts[3]) : undefined;

    if (isNaN(quantity) || quantity <= 0) {
      await this.sendMessage(chatId, "Quantity must be a positive number");
      return;
    }

    if (limitPrice !== undefined && (isNaN(limitPrice) || limitPrice <= 0)) {
      await this.sendMessage(chatId, "Limit price must be a positive number");
      return;
    }

    await this.sendMessage(chatId, `Placing buy order for ${quantity} shares of ${symbol}${limitPrice ? ` at $${limitPrice}` : ''}...`);

    try {
      const result = await this.tradingService.placeOrder({
        symbol,
        qty: quantity,
        side: 'buy',
        type: limitPrice ? 'limit' : 'market',
        time_in_force: 'day',
        limit_price: limitPrice,
        telegram_chat_id: chatId.toString()
      });

      if (!result) {
        throw new Error("Failed to place order");
      }

      await this.sendMessage(
        chatId, 
        `✅ Order placed successfully! Order ID: ${result.id}`
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async handleSellCommand(chatId: number, parts: string[]): Promise<void> {
    // Expected format: /sell SYMBOL QUANTITY [LIMIT_PRICE]
    if (parts.length < 3) {
      await this.sendMessage(chatId, "Usage: /sell SYMBOL QUANTITY [LIMIT_PRICE]");
      return;
    }

    const symbol = parts[1].toUpperCase();
    const quantity = parseInt(parts[2], 10);
    const limitPrice = parts.length > 3 ? parseFloat(parts[3]) : undefined;

    if (isNaN(quantity) || quantity <= 0) {
      await this.sendMessage(chatId, "Quantity must be a positive number");
      return;
    }

    if (limitPrice !== undefined && (isNaN(limitPrice) || limitPrice <= 0)) {
      await this.sendMessage(chatId, "Limit price must be a positive number");
      return;
    }

    await this.sendMessage(chatId, `Placing sell order for ${quantity} shares of ${symbol}${limitPrice ? ` at $${limitPrice}` : ''}...`);

    try {
      const result = await this.tradingService.placeOrder({
        symbol,
        qty: quantity,
        side: 'sell',
        type: limitPrice ? 'limit' : 'market',
        time_in_force: 'day',
        limit_price: limitPrice,
        telegram_chat_id: chatId.toString()
      });

      if (!result) {
        throw new Error("Failed to place order");
      }

      await this.sendMessage(
        chatId, 
        `✅ Order placed successfully! Order ID: ${result.id}`
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async handleAlertCommand(chatId: number, parts: string[]): Promise<void> {
    if (parts.length < 2) {
      await this.sendMessage(chatId, "Usage: /alert create|list|delete ...");
      return;
    }

    const subCommand = parts[1].toLowerCase();

    switch (subCommand) {
      case 'create':
        await this.handleCreateAlert(chatId, parts.slice(2));
        break;
      case 'list':
        await this.handleListAlerts(chatId);
        break;
      case 'delete':
        await this.handleDeleteAlert(chatId, parts[2]);
        break;
      default:
        await this.sendMessage(chatId, "Unknown alert command. Use create, list, or delete.");
    }
  }

  async handleCreateAlert(chatId: number, args: string[]): Promise<void> {
    // Expected format: SYMBOL CONDITION THRESHOLD
    if (args.length < 3) {
      await this.sendMessage(chatId, "Usage: /alert create SYMBOL CONDITION THRESHOLD\nConditions: price_above, price_below");
      return;
    }

    const symbol = args[0].toUpperCase();
    const condition = args[1].toLowerCase();
    const threshold = parseFloat(args[2]);

    if (!['price_above', 'price_below'].includes(condition)) {
      await this.sendMessage(chatId, "Condition must be price_above or price_below");
      return;
    }

    if (isNaN(threshold) || threshold <= 0) {
      await this.sendMessage(chatId, "Threshold must be a positive number");
      return;
    }

    try {
      const alert = await this.alertService.createAlert({
        symbol,
        condition,
        threshold,
        telegram_chat_id: chatId.toString()
      });

      await this.sendMessage(
        chatId,
        `Alert created: Notify when ${symbol} price goes ${condition === 'price_above' ? 'above' : 'below'} $${threshold.toFixed(2)}.`
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async handleListAlerts(chatId: number): Promise<void> {
    try {
      const alerts = await this.alertService.getAlertsByTelegramId(chatId.toString());

      if (alerts.length === 0) {
        await this.sendMessage(chatId, "You have no active alerts.");
        return;
      }

      let message = "Your active alerts:\n\n";
      alerts.forEach((alert, index) => {
        message += `${index + 1}. ${alert.symbol} - ${alert.condition.replace('_', ' ')} $${alert.threshold.toFixed(2)} (ID: ${alert.id})\n`;
      });

      await this.sendMessage(chatId, message);
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async handleDeleteAlert(chatId: number, alertId: string): Promise<void> {
    if (!alertId) {
      await this.sendMessage(chatId, "Usage: /alert delete ALERT_ID");
      return;
    }

    try {
      const success = await this.alertService.deleteAlert(alertId, chatId.toString());
      
      if (success) {
        await this.sendMessage(chatId, `Alert with ID ${alertId} has been deleted.`);
      } else {
        await this.sendMessage(chatId, `Alert with ID ${alertId} not found or you don't have permission to delete it.`);
      }
    } catch (error) {
      await this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Failed to send Telegram message');
      }
    } catch (error) {
      console.error('🚨 Telegram notification error:', error);
    }
  }

  async verifyConnection(chatId: string): Promise<boolean> {
    // Only allow verification for the specific user
    if (chatId !== ALLOWED_USER_ID) {
      console.log(`Unauthorized verification attempt from: ${chatId}`);
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId
        })
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error verifying Telegram connection:', error);
      return false;
    }
  }

  // Add new method to verify any user ID
  async verifyUserId(userId: string): Promise<boolean> {
    try {
      // Try to get chat information from Telegram API
      const response = await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId
        })
      });
  
      const data = await response.json();
      
      // If the API call is successful, the user ID is valid
      if (data.ok) {
        // Initialize settings for this user if they don't exist
        if (!userSettings.has(userId)) {
          userSettings.set(userId, {
            price_alerts: true,
            order_notifications: true,
            trade_commands: true,
            chat_commands: true,
            updated_at: new Date().toISOString()
          });
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying user ID:', error);
      return false;
    }
  }

  // Also update the updateSettings method to work with any verified user ID
  async updateSettings(chatId: string, settings: any): Promise<boolean> {
    try {
      // Remove the restriction to only ALLOWED_USER_ID
      // Update settings in memory
      const currentSettings = userSettings.get(chatId) || {};
      userSettings.set(chatId, {
        ...currentSettings,
        ...settings,
        updated_at: new Date().toISOString()
      });
      
      console.log(`Updated settings for user ${chatId}:`, userSettings.get(chatId));
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  // Update the getSettings method to work with any verified user ID
  async getSettings(chatId: string): Promise<any> {
    // Return settings from in-memory storage
    return userSettings.get(chatId) || {
      price_alerts: true,
      order_notifications: true,
      trade_commands: true,
      chat_commands: true,
      updated_at: new Date().toISOString()
    };
  }

  async getSonarResponse(question: string): Promise<string> {
    if (!this.SONAR_API_KEY) {
      throw new Error("Sonar API key is not configured");
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SONAR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst assistant that provides accurate, helpful information about markets, stocks, and economic events. Include relevant facts, data, and context in your answers. Format your responses in a clean, scannable style for Telegram.'
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.2,
          max_tokens: 800,
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sonar API error response:', errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching from Sonar API:', error);
      throw error;
    }
  }
}
