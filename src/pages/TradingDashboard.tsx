
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

// Trading components
import StockChartPanel from "@/components/trading/StockChartPanel";
import MarketAnalystPanel from "@/components/trading/MarketAnalystPanel";
import AccountSummary from "@/components/trading/AccountSummary";
import PositionsTable from "@/components/trading/PositionsTable";
import OrdersTable from "@/components/trading/OrdersTable";
import TradePanel from "@/components/trading/TradePanel";
import WatchlistManager from "@/components/trading/WatchlistManager";
import TelegramBotPanel from "@/components/trading/TelegramBotPanel";
import { useTradingData } from "@/hooks/useTradingData";

const TradingDashboard = () => {
  const isMobile = useIsMobile();
  const [currentSymbol, setCurrentSymbol] = useState("AAPL");
  
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
    
    // Log some debug information
    console.log("Trading Dashboard mounted");
  }, []);

  // Debug log when watchlists change
  useEffect(() => {
    console.log("Watchlists updated:", watchlists);
  }, [watchlists]);

  // Handle symbol change from chart
  const handleSymbolChange = (symbol: string) => {
    setCurrentSymbol(symbol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#131b2e]">
      <DashboardHeader />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading Dashboard</h1>
          <Button 
            onClick={refreshAll}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
            disabled={isLoadingAccount || isLoadingPositions || isLoadingOrders || isLoadingWatchlists}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${
              (isLoadingAccount || isLoadingPositions || isLoadingOrders || isLoadingWatchlists) ? 'animate-spin' : ''
            }`} />
            Refresh All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Stock Chart Panel */}
          <StockChartPanel onSymbolChange={handleSymbolChange} />
          
          {/* AI Market Analyst Panel */}
          <MarketAnalystPanel symbol={currentSymbol} />
          
          {/* Account Summary */}
          <AccountSummary account={account} isLoading={isLoadingAccount} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Positions Table */}
            <div className="lg:col-span-2 overflow-x-auto">
              <PositionsTable positions={positions} isLoading={isLoadingPositions} />
            </div>
            
            {/* Trade Panel */}
            <div>
              <TradePanel onPlaceOrder={placeOrder} isProcessing={isProcessingOrder} />
            </div>
          </div>

          {/* Two Panels Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Orders Table */}
            <div className="overflow-x-auto">
              <OrdersTable 
                orders={orders} 
                isLoading={isLoadingOrders} 
                onRefresh={refreshOrders} 
                onCancelOrder={cancelOrder}
              />
            </div>
            
            {/* Telegram Bot Panel */}
            <div>
              <TelegramBotPanel />
            </div>
          </div>
          
          {/* Watchlist Manager */}
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
