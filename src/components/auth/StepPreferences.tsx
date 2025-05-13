
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface StepPreferencesProps {
  markets: string[];
  setMarkets: (value: string[]) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  isLoading: boolean;
}

const marketOptions = [
  'US Equities', 
  'European Markets', 
  'Asia Pacific', 
  'Emerging Markets', 
  'Commodities', 
  'Forex', 
  'Crypto', 
  'Real Estate'
];

const StepPreferences: React.FC<StepPreferencesProps> = ({
  markets,
  setMarkets,
  notifications,
  setNotifications,
  isLoading
}) => {
  const handleMarketToggle = (market: string, checked: boolean) => {
    if (checked) {
      setMarkets([...markets, market]);
    } else {
      setMarkets(markets.filter(m => m !== market));
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Markets of Interest (Choose one or more)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {marketOptions.map((market) => (
            <div key={market} className="flex items-center space-x-2">
              <Checkbox 
                id={market.toLowerCase().replace(/\s/g, '-')}
                checked={markets.includes(market)}
                onCheckedChange={(checked) => handleMarketToggle(market, checked === true)}
                disabled={isLoading}
              />
              <label htmlFor={market.toLowerCase().replace(/\s/g, '-')} className="text-sm text-gray-300 cursor-pointer">
                {market}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="notifications" 
          checked={notifications}
          onCheckedChange={(checked) => setNotifications(checked === true)}
          disabled={isLoading}
        />
        <label htmlFor="notifications" className="text-sm text-gray-300 cursor-pointer">
          Receive email notifications for market insights and alerts
        </label>
      </div>

      <p className="text-sm text-gray-400 italic">
        Your preferences help us provide the most relevant information and alerts.
        You can always change these settings later.
      </p>
    </div>
  );
};

export default StepPreferences;
