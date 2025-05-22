
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, BellOff, RefreshCw, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

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
  const [connectionChecking, setConnectionChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [settings, setSettings] = useState<TelegramSettings>({
    userId: "",
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
        // Try to fetch settings from localStorage first
        const savedSettings = localStorage.getItem('telegramSettings');
        const savedUserId = localStorage.getItem('telegramUserId');
        
        if (savedUserId) {
          setUserId(savedUserId);
        }
        
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          setIsLoading(false);
          return;
        }
        
        // If no localStorage settings, use default settings
        const defaultSettings = {
          userId: "",
          priceAlerts: true,
          orderNotifications: true,
          tradeCommands: true,
          chatCommands: true
        };
        
        setSettings(defaultSettings);
        // Save to localStorage for future use
        localStorage.setItem('telegramSettings', JSON.stringify(defaultSettings));
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
      
      // Use the current userId from the input field
      newSettings.userId = userId;
      
      // Store in localStorage
      localStorage.setItem('telegramSettings', JSON.stringify(newSettings));
      localStorage.setItem('telegramUserId', userId);
      
      // Try to send the settings to the Edge Function directly
      try {
        const response = await fetch(`https://qlzjoasyheqykokiljwj.supabase.co/functions/v1/telegram-bot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update_settings',
            user_id: userId,
            settings: {
              price_alerts: newSettings.priceAlerts,
              order_notifications: newSettings.orderNotifications,
              trade_commands: newSettings.tradeCommands,
              chat_commands: newSettings.chatCommands
            }
          })
        });
        
        if (response.ok) {
          toast({
            title: "Settings Saved",
            description: "Your Telegram bot settings have been updated",
          });
        } else {
          console.log("Edge function response:", await response.text());
          // Even if the edge function call fails, we still have settings in localStorage
          toast({
            title: "Settings Saved Locally",
            description: "Your settings were saved locally but could not be synchronized",
          });
        }
      } catch (error) {
        console.error("Error calling edge function:", error);
        // Even if there's an error, the settings are still in localStorage
        toast({
          title: "Settings Saved Locally",
          description: "Your settings were saved locally but could not be synchronized",
        });
      }
      
      setSettings(newSettings);
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
    // Check if user ID is provided
    if (!userId || userId.trim() === "") {
      toast({
        title: "User ID Required",
        description: "Please enter your Telegram User ID to verify connection",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setConnectionChecking(true);
      setConnectionStatus(null);
      
      const response = await fetch(`https://qlzjoasyheqykokiljwj.supabase.co/functions/v1/telegram-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_connection',
          user_id: userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConnectionStatus(data.status);
      
      toast({
        title: data.status === 'connected' ? "Connection Verified" : "Not Connected",
        description: data.status === 'connected' 
          ? "Your Telegram bot connection is active"
          : "Your Telegram bot is not connected. Please start a chat with the bot first.",
      });
    } catch (error) {
      console.error("Error verifying Telegram connection:", error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Connection Error",
        description: "Could not verify Telegram bot connection",
        variant: "destructive",
      });
    } finally {
      setConnectionChecking(false);
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
        <div className="space-y-2">
          <Label className="text-white" htmlFor="userId">Your Telegram User ID</Label>
          <div className="flex space-x-2">
            <Input
              id="userId"
              className="flex-1 bg-[#262b3c] text-white border-white/10"
              placeholder="Enter your Telegram user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshConnection}
              disabled={connectionChecking || !userId}
              className="bg-transparent border-teal-500 text-teal-500 hover:bg-teal-500/10"
            >
              {connectionChecking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verify
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Find your Telegram user ID by sending /start to @userinfobot on Telegram
          </p>
        </div>

        <div className={`p-3 rounded-md mb-4 ${
          connectionStatus === 'connected' ? 'bg-green-900/20 border border-green-600/30' : 
          connectionStatus === 'disconnected' ? 'bg-red-900/20 border border-red-600/30' : 
          'bg-blue-900/20 border border-blue-600/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {connectionStatus === 'connected' ? (
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              ) : connectionStatus === 'disconnected' ? (
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              ) : (
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              )}
              <span className="text-sm font-medium text-white">
                {connectionStatus === 'connected' ? 'Bot Connected' : 
                 connectionStatus === 'disconnected' ? 'Bot Not Connected' : 
                 'Connection Status Unknown'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {connectionStatus === 'connected' ? (
              'Your Telegram bot is connected and ready to receive commands.'
            ) : connectionStatus === 'disconnected' ? (
              <>To connect, search for &quot;@YourTradingBot&quot; on Telegram and start a chat with the bot.</>
            ) : (
              'Click "Verify" to check if your Telegram bot is connected.'
            )}
          </div>
        </div>

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
              disabled={isSaving || connectionStatus !== 'connected'}
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
              disabled={isSaving || connectionStatus !== 'connected'}
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
              disabled={isSaving || connectionStatus !== 'connected'}
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
              disabled={isSaving || connectionStatus !== 'connected'}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0 border-t border-white/10">
        {isSaving && (
          <div className="flex items-center text-teal-400 text-sm">
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            Saving...
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default TelegramBotPanel;
