
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlpacaAccount, AlpacaOrder } from "@/types/alpaca";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart4, TrendingDown, TrendingUp, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSonarAnalysis } from "@/hooks/useSonarAnalysis";
import NewsAnalysisPanel from "./NewsAnalysisPanel";

const INITIAL_INVESTMENT = 25000; // Default initial investment amount

interface EnhancedAccountSummaryProps {
  account: AlpacaAccount | null;
  isLoading: boolean;
  orders?: AlpacaOrder[];
  initialInvestment?: number;
  adminAccess?: boolean;
}

const EnhancedAccountSummary: React.FC<EnhancedAccountSummaryProps> = ({
  account,
  isLoading,
  orders = [],
  initialInvestment = INITIAL_INVESTMENT,
  adminAccess = false,
}) => {
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const {
    analysisLoading,
    stockAnalysis,
    healthScore,
    sentiment,
    newsItems,
    citations,
    runAccountAnalysis
  } = useSonarAnalysis();

  // Run analysis when account data changes significantly
  useEffect(() => {
    if (account && orders.length > 0 && !analysisLoading && !stockAnalysis) {
      runAccountAnalysis(account, orders);
    }
  }, [account, orders, runAccountAnalysis, analysisLoading, stockAnalysis]);

  // Calculate portfolio performance
  const calculatePerformance = () => {
    if (!account) return { value: 0, percentage: 0, isPositive: false };
    
    const currentValue = parseFloat(account.equity);
    const diff = currentValue - initialInvestment;
    const percentage = (diff / initialInvestment) * 100;
    
    return {
      value: Math.abs(diff),
      percentage: Math.abs(percentage),
      isPositive: diff >= 0
    };
  };

  const performance = calculatePerformance();

  // Get recent orders, limited to 5
  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="bg-[#0f1628]/80 backdrop-blur-sm border border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Skeleton className="h-6 w-40 bg-white/10" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60 bg-white/10" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-5 w-20 bg-white/10" />
                <Skeleton className="h-8 w-full bg-white/10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#0f1628]/80 backdrop-blur-sm border border-white/5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Account Summary
                <Badge variant={performance.isPositive ? "default" : "destructive"} className="h-5 ml-2">
                  {performance.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {performance.percentage.toFixed(2)}%
                </Badge>
              </CardTitle>
              <CardDescription>
                Initial Investment: ${initialInvestment.toLocaleString()}
              </CardDescription>
            </div>
            <div>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                {!showAnalysis ? (
                  <span className="flex items-center">
                    <BarChart4 className="h-3 w-3 mr-1" />
                    View Analysis
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide Analysis
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 p-3 rounded-lg">
              <span className="text-xs text-gray-400">Current Equity</span>
              <div className="text-xl font-bold text-white mt-0.5">
                ${account ? parseFloat(account.equity).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"}
              </div>
              <div className="text-xs mt-1 flex items-center">
                {performance.isPositive ? (
                  <span className="text-green-400">+${performance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                ) : (
                  <span className="text-red-400">-${performance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                )}
                <span className="text-gray-500 ml-1">since start</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <span className="text-xs text-gray-400">Buying Power</span>
              <div className="text-xl font-bold text-white mt-0.5">
                ${account ? parseFloat(account.buying_power).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                Available for trading
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <span className="text-xs text-gray-400">Cash Balance</span>
              <div className="text-xl font-bold text-white mt-0.5">
                ${account ? parseFloat(account.cash).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                Settled funds
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Recent Orders</span>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-white/5 transition-colors h-5"
                  onClick={() => setShowRecentOrders(!showRecentOrders)}
                >
                  {showRecentOrders ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Badge>
              </div>
              <div className="text-xl font-bold text-white mt-0.5">
                {orders.length}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {orders.length > 0 
                  ? `Last order: ${new Date(orders[0].created_at).toLocaleDateString()}`
                  : "No recent orders"}
              </div>
            </div>
          </div>
          
          {/* Recent Orders Dropdown */}
          {showRecentOrders && (
            <div className="mt-4 bg-black/20 p-3 rounded-lg animate-in fade-in-5 slide-in-from-top-5">
              <h4 className="text-sm font-medium text-white mb-2">Recent Orders</h4>
              {recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center border-b border-white/10 pb-2">
                      <div className="flex items-center">
                        <Badge variant={order.side === "buy" ? "default" : "destructive"} className="mr-2">
                          {order.side.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium text-white">{order.symbol}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-300 mr-2">{order.qty} shares @ {order.filled_avg_price || "Market"}</span>
                        <Badge variant={
                          order.status === "filled" ? "outline" : 
                          order.status === "canceled" ? "destructive" : 
                          "secondary"
                        }>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No recent orders found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Panel */}
      {showAnalysis && (
        <NewsAnalysisPanel
          loading={analysisLoading}
          summary={stockAnalysis}
          healthScore={healthScore}
          sentiment={sentiment}
          newsItems={newsItems}
          citations={citations}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
};

export default EnhancedAccountSummary;
