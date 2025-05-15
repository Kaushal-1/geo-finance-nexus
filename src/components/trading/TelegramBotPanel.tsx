
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, BellOff, RefreshCw, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type TelegramSettings = {
  userId: string;
  priceAlerts: boolean;
  orderNotifications: boolean;
  tradeCommands: boolean;
  chatCommands: boolean;
}

const TelegramBotPanel = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<TelegramSettings>({
    userId: "2085478565", // Default user ID
    priceAlerts: true,
    orderNotifications: true,
    tradeCommands: true,
    chatCommands: true
  });

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('telegram_settings')
          .select('*')
          .eq('user_id', settings.userId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error;
        }
        
        if (data) {
          setSettings({
            userId: data.user_id,
            priceAlerts: data.price_alerts,
            orderNotifications: data.order_notifications,
            tradeCommands: data.trade_commands,
            chatCommands: data.chat_commands
          });
        } else {
          // If no settings exist, create default ones
          await saveSettings({
            userId: settings.userId,
            priceAlerts: true,
            orderNotifications: true,
            tradeCommands: true,
            chatCommands: true
          });
        }
      } catch (error) {
        console.error("Error fetching Telegram settings:", error);
        toast({
          title: "Error",
          description: "Failed to load Telegram settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: TelegramSettings) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('telegram_settings')
        .upsert(
          {
            user_id: newSettings.userId,
            price_alerts: newSettings.priceAlerts,
            order_notifications: newSettings.orderNotifications,
            trade_commands: newSettings.tradeCommands,
            chat_commands: newSettings.chatCommands,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
      
      if (error) throw error;
      
      setSettings(newSettings);
      toast({
        title: "Settings Saved",
        description: "Your Telegram bot settings have been updated",
      });
    } catch (error) {
      console.error("Error saving Telegram settings:", error);
      toast({
        title: "Error",
        description: "Failed to save Telegram settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (setting: keyof Omit<TelegramSettings, 'userId'>, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    saveSettings(newSettings);
  };

  const handleRefreshConnection = async () => {
    try {
      setIsLoading(true);
      // Trigger backend function to check Telegram connection
      const response = await fetch(`https://qlzjoasyheqykokiljwj.supabase.co/functions/v1/telegram-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_connection',
          user_id: settings.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast({
        title: "Connection Verified",
        description: "Your Telegram bot connection is active",
      });
    } catch (error) {
      console.error("Error verifying Telegram connection:", error);
      toast({
        title: "Connection Error",
        description: "Could not verify Telegram bot connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-teal-500" />
          Telegram Bot Integration
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage your Telegram trading notifications and commands
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Price Alerts</Label>
              <p className="text-xs text-gray-400">
                Receive notifications when stock prices hit your targets
              </p>
            </div>
            <Switch
              checked={settings.priceAlerts}
              onCheckedChange={(checked) => handleSettingChange('priceAlerts', checked)}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Order Notifications</Label>
              <p className="text-xs text-gray-400">
                Get updates when your orders are executed, filled, or canceled
              </p>
            </div>
            <Switch
              checked={settings.orderNotifications}
              onCheckedChange={(checked) => handleSettingChange('orderNotifications', checked)}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Trade Commands</Label>
              <p className="text-xs text-gray-400">
                Allow executing buy/sell orders via Telegram
              </p>
            </div>
            <Switch
              checked={settings.tradeCommands}
              onCheckedChange={(checked) => handleSettingChange('tradeCommands', checked)}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Chat Commands</Label>
              <p className="text-xs text-gray-400">
                Enable AI-powered market research via Telegram
              </p>
            </div>
            <Switch
              checked={settings.chatCommands}
              onCheckedChange={(checked) => handleSettingChange('chatCommands', checked)}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0 border-t border-white/10">
        <div className="text-sm text-gray-400">
          User ID: {settings.userId}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshConnection}
          disabled={isLoading || isSaving}
          className="bg-transparent border-teal-500 text-teal-500 hover:bg-teal-500/10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Verify Connection
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TelegramBotPanel;
