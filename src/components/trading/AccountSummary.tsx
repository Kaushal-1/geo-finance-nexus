
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { getAccountInfo } from "@/services/alpacaService";
import { useToast } from "@/components/ui/use-toast";

const AccountSummary = () => {
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const data = await getAccountInfo();
      setAccountData(data);
    } catch (error) {
      toast({
        title: "Error fetching account data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(fetchAccountData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Calculate daily P/L
  const dailyPL = accountData ? parseFloat(accountData.equity) - parseFloat(accountData.last_equity) : 0;
  const isProfitable = dailyPL >= 0;

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg font-medium">Account Summary</CardTitle>
        <button 
          onClick={fetchAccountData}
          className="p-1 rounded-full hover:bg-white/10"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-8 w-32 bg-white/10" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-16 bg-white/10" />
              <Skeleton className="h-16 bg-white/10" />
              <Skeleton className="h-16 bg-white/10" />
              <Skeleton className="h-16 bg-white/10" />
            </div>
          </div>
        ) : accountData ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Equity</p>
              <div className="flex items-center gap-2">
                {dailyPL !== 0 && (
                  <>
                    <span className={`text-xs ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      {isProfitable ? '+' : ''}{formatCurrency(dailyPL)} today
                    </span>
                    {isProfitable ? 
                      <ArrowUp className="h-3 w-3 text-green-500" /> : 
                      <ArrowDown className="h-3 w-3 text-red-500" />}
                  </>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-5">{formatCurrency(parseFloat(accountData.equity))}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Cash Balance</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(parseFloat(accountData.cash))}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Buying Power</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(parseFloat(accountData.buying_power))}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Account Status</p>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${accountData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <p className="text-white">{accountData.status}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Portfolio Value</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(parseFloat(accountData.equity) - parseFloat(accountData.cash))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">Could not load account data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
