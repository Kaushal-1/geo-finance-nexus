
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlpacaAccount } from "@/types/alpaca";
import { ArrowUp, ArrowDown, DollarSign, Wallet } from "lucide-react";

interface AccountSummaryProps {
  account: AlpacaAccount | null;
  isLoading: boolean;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ account, isLoading }) => {
  // Calculate daily P/L
  const dailyPL = account ? 
    parseFloat(account.equity) - parseFloat(account.last_equity) : 
    0;
  
  const dailyPLPercentage = account && parseFloat(account.last_equity) > 0 ? 
    (dailyPL / parseFloat(account.last_equity)) * 100 : 
    0;

  if (isLoading) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col space-y-1 animate-pulse">
                <div className="h-5 w-24 bg-white/20 rounded"></div>
                <div className="h-8 w-32 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-400">
            Unable to load account data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white">Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Total Equity</span>
            <span className="text-xl font-bold text-white">${parseFloat(account.equity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Cash</span>
            <span className="text-xl font-bold text-white">${parseFloat(account.cash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Buying Power</span>
            <span className="text-xl font-bold text-white">${parseFloat(account.buying_power).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Daily P/L</span>
            <div className={`flex items-center ${dailyPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {dailyPL >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span className="text-xl font-bold">${Math.abs(dailyPL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({dailyPLPercentage.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
