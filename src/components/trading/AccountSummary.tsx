
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlpacaAccount } from "@/types/alpaca";
import { ArrowUp, ArrowDown, DollarSign, Wallet, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useSonarAnalysis } from "@/hooks/useSonarAnalysis";

interface AccountSummaryProps {
  account: AlpacaAccount | null;
  isLoading: boolean;
  orders?: any[];
  initialInvestment?: number;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ 
  account, 
  isLoading,
  orders = [],
  initialInvestment = 25000 // Default initial investment
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [showOrders, setShowOrders] = useState(false);
  
  // Calculate performance metrics
  const dailyPL = account ? 
    parseFloat(account.equity) - parseFloat(account.last_equity) : 
    0;
  
  const dailyPLPercentage = account && parseFloat(account.last_equity) > 0 ? 
    (dailyPL / parseFloat(account.last_equity)) * 100 : 
    0;
  
  const totalReturn = account ? 
    ((parseFloat(account.equity) / initialInvestment) - 1) * 100 :
    0;

  // Get account health analysis
  const { analysisLoading, healthScore, stockAnalysis, runAccountAnalysis } = useSonarAnalysis();
  
  // Format time for orders
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "N/A";
    try {
      return formatDistanceToNow(new Date(timeStr), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Request account analysis
  const handleAnalyzeAccount = async () => {
    if (account) {
      await runAccountAnalysis(account, orders);
    } else {
      toast({
        title: "Analysis Failed",
        description: "Account data not available. Please try again later.",
        variant: "destructive",
      });
    }
  };

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
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-white">Account Summary</CardTitle>
        <div className="flex items-center space-x-2">
          {healthScore && (
            <div className="flex items-center mr-2">
              <span className="text-sm text-gray-400 mr-2">Health:</span>
              <div className="bg-gray-700 rounded-full h-2 w-28 overflow-hidden">
                <div 
                  className={`h-full ${
                    healthScore >= 70 ? 'bg-green-500' : 
                    healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-white">{healthScore}</span>
            </div>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAnalyzeAccount} 
            disabled={analysisLoading}
            className="text-teal-400 border-teal-400 hover:bg-teal-900/20"
          >
            <TrendingUp className="h-4 w-4 mr-1" /> 
            {analysisLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 bg-black/20 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details & Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
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
            
            {/* Second row with additional metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Initial Investment</span>
                <span className="text-lg font-medium text-white">${initialInvestment.toLocaleString('en-US')}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Total Return</span>
                <div className={`flex items-center ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalReturn >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                  <span className="text-lg font-medium">{totalReturn.toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Long Value</span>
                <span className="text-lg font-medium text-white">${parseFloat(account.long_market_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Short Value</span>
                <span className="text-lg font-medium text-white">${parseFloat(account.short_market_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            {/* Account analysis result */}
            {stockAnalysis && (
              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">Portfolio Analysis</h4>
                  <Badge variant={healthScore && healthScore >= 70 ? "default" : healthScore && healthScore >= 40 ? "outline" : "destructive"}>
                    {healthScore && healthScore >= 70 ? "Healthy" : healthScore && healthScore >= 40 ? "Moderate" : "At Risk"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-300">{stockAnalysis}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Account Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account ID</span>
                    <span className="text-white">{account.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge variant={account.status === 'ACTIVE' ? "default" : "outline"}>
                      {account.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency</span>
                    <span className="text-white">{account.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pattern Day Trader</span>
                    <Badge variant={account.pattern_day_trader ? "destructive" : "outline"}>
                      {account.pattern_day_trader ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trading Blocked</span>
                    <Badge variant={account.trading_blocked ? "destructive" : "outline"}>
                      {account.trading_blocked ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transfers Blocked</span>
                    <Badge variant={account.transfers_blocked ? "destructive" : "outline"}>
                      {account.transfers_blocked ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-white">Recent Orders</h4>
                  <DropdownMenu open={showOrders} onOpenChange={setShowOrders}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Clock className="h-4 w-4 mr-1" /> View Orders
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 bg-[#1a2035] border-white/10">
                      <DropdownMenuSeparator className="bg-white/10" />
                      {orders && orders.length > 0 ? (
                        orders.slice(0, 5).map((order: any) => (
                          <DropdownMenuItem key={order.id} className="flex flex-col items-start p-2">
                            <div className="flex w-full justify-between items-center">
                              <span className="font-medium text-teal-400">{order.symbol}</span>
                              <Badge className={order.side === 'buy' ? 'bg-green-600' : 'bg-red-600'}>
                                {order.side.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex w-full justify-between text-xs mt-1">
                              <span className="text-gray-400">{formatTime(order.submitted_at)}</span>
                              <span className="text-white">{order.qty} @ {order.filled_avg_price || 'Market'}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem className="text-center text-gray-400">
                          No recent orders
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="justify-center text-blue-400 cursor-pointer" onClick={() => setActiveTab("orders")}>
                        View all orders
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Account Metrics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maintenance Margin</span>
                    <span className="text-white">${parseFloat(account.maintenance_margin).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daytrade Power</span>
                    <span className="text-white">${parseFloat(account.daytrading_buying_power).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">RegT Power</span>
                    <span className="text-white">${parseFloat(account.regt_buying_power).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Created</span>
                    <span className="text-white">{formatTime(account.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Premium Features Teaser */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            <span>Paper Trading Account</span>
            <Badge variant="outline" className="ml-2 bg-blue-900/20 text-blue-300 border-blue-800">FREE</Badge>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs text-blue-300 border-blue-800 hover:bg-blue-900/30">
            Upgrade to Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
