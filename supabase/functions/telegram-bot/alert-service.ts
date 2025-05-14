
// Alert service to handle price alerts
export class AlertService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async createAlert(alertData: {
    symbol: string;
    condition: string;
    threshold: number;
    telegram_chat_id: string;
  }) {
    try {
      console.log(`Creating alert for ${alertData.symbol} ${alertData.condition} ${alertData.threshold}`);

      const { data, error } = await this.supabase
        .from('price_alerts')
        .insert([
          {
            symbol: alertData.symbol,
            condition: alertData.condition,
            threshold: alertData.threshold,
            telegram_chat_id: alertData.telegram_chat_id,
            created_at: new Date().toISOString(),
            active: true
          }
        ])
        .select();

      if (error) {
        console.error('Error creating alert:', error);
        throw new Error(`Failed to create alert: ${error.message}`);
      }

      return data[0];
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error(`Failed to create alert: ${error.message}`);
    }
  }

  async getAlertsByTelegramId(telegramChatId: string) {
    try {
      const { data, error } = await this.supabase
        .from('price_alerts')
        .select('*')
        .eq('telegram_chat_id', telegramChatId)
        .eq('active', true);

      if (error) {
        console.error('Error fetching alerts:', error);
        throw new Error(`Failed to fetch alerts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }
  }

  async deleteAlert(alertId: string, telegramChatId: string) {
    try {
      // First check if the alert belongs to this user
      const { data: alertData } = await this.supabase
        .from('price_alerts')
        .select('*')
        .eq('id', alertId)
        .eq('telegram_chat_id', telegramChatId)
        .single();

      if (!alertData) {
        return false; // Alert not found or doesn't belong to this user
      }

      // Now delete the alert
      const { error } = await this.supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId)
        .eq('telegram_chat_id', telegramChatId);

      if (error) {
        console.error('Error deleting alert:', error);
        throw new Error(`Failed to delete alert: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw new Error(`Failed to delete alert: ${error.message}`);
    }
  }

  async getAllActiveAlerts() {
    try {
      const { data, error } = await this.supabase
        .from('price_alerts')
        .select('*')
        .eq('active', true);

      if (error) {
        console.error('Error fetching all alerts:', error);
        throw new Error(`Failed to fetch all alerts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all alerts:', error);
      throw new Error(`Failed to fetch all alerts: ${error.message}`);
    }
  }

  async triggerAlert(alertId: string) {
    try {
      // Mark the alert as triggered
      const { error } = await this.supabase
        .from('price_alerts')
        .update({ 
          triggered_at: new Date().toISOString(),
          active: false
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error triggering alert:', error);
        throw new Error(`Failed to trigger alert: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error triggering alert:', error);
      throw new Error(`Failed to trigger alert: ${error.message}`);
    }
  }
}
