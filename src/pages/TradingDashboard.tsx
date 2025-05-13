
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Trading components
import AccountSummary from "@/components/trading/AccountSummary";
import PositionsTable from "@/components/trading/PositionsTable";
import OrdersTable from "@/components/trading/OrdersTable";
import TradePanel from "@/components/trading/TradePanel";
import WatchlistManager from "@/components/trading/WatchlistManager";
import { useTradingData } from "@/hooks/useTradingData";

const TradingDashboard = () => {
  const { 
    account,
    positions,
    orders,
    watchlists,
    isLoadingAccount,
    isLoadingPositions,
    isLoadingOrders,
    isLoadingWatchlists,
    isProcessingOrder,
    placeOrder,
    cancelOrder,
    refreshOrders,
    createWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    deleteWatchlist,
    refreshWatchlists,
    refreshAll
  } = useTradingData();

  // Initial welcome toast
  useEffect(() => {
    toast({
      title: "Trading Dashboard",
      description: "Welcome to the Alpaca Paper Trading Dashboard. All trades are simulated.",
      duration: 5000
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#131b2e]">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
          <Button 
            onClick={refreshAll}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={isLoadingAccount || isLoadingPositions || isLoadingOrders || isLoadingWatchlists}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${
              (isLoadingAccount || isLoadingPositions || isLoadingOrders || isLoadingWatchlists) ? 'animate-spin' : ''
            }`} />
            Refresh All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Account Summary */}
          <AccountSummary account={account} isLoading={isLoadingAccount} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Positions Table */}
            <div className="lg:col-span-2">
              <PositionsTable positions={positions} isLoading={isLoadingPositions} />
            </div>
            
            {/* Right Column: Trade Panel */}
            <div>
              <TradePanel onPlaceOrder={placeOrder} isProcessing={isProcessingOrder} />
            </div>
          </div>

          {/* Orders Table - Full Width */}
          <OrdersTable 
            orders={orders} 
            isLoading={isLoadingOrders} 
            onRefresh={refreshOrders} 
            onCancelOrder={cancelOrder}
          />
          
          {/* Watchlist Manager - Full Width */}
          <WatchlistManager 
            watchlists={watchlists}
            isLoading={isLoadingWatchlists}
            onCreateWatchlist={createWatchlist}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onDeleteWatchlist={deleteWatchlist}
            onRefreshWatchlists={refreshWatchlists}
          />
          
          {/* Notice Card */}
          <Card className="bg-blue-900/20 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center text-blue-300 text-sm">
              This is a paper trading platform using Alpaca API. No real money is being used.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TradingDashboard;
