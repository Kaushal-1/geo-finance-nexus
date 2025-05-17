
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import GlobalNavbar from "@/components/shared/GlobalNavbar";
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
import SonarScreener from "@/components/trading/SonarScreener";
import { useTradingData } from "@/hooks/useTradingData";

const TradingDashboard = () => {
  const isMobile = useIsMobile();
  const [currentSymbol, setCurrentSymbol] = useState("AAPL");
  const [isAdminMode, setIsAdminMode] = useState(false);
  
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
    
    // Check for admin mode (could be based on URL parameter, localStorage, etc.)
    const checkAdminMode = () => {
      // For demo purposes, let's use a simple localStorage check
      // In a real app, this would be based on authentication
      const isAdmin = localStorage.getItem('trader_admin_mode') === 'true';
      setIsAdminMode(isAdmin);
      
      // Admin mode keyboard shortcut (Ctrl+Shift+A)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          const newAdminMode = !isAdminMode;
          localStorage.setItem('trader_admin_mode', newAdminMode.toString());
          setIsAdminMode(newAdminMode);
          toast({
            title: newAdminMode ? "Admin Mode Activated" : "Admin Mode Deactivated",
            description: newAdminMode 
              ? "You now have access to advanced features and complete data visibility."
              : "Returned to standard user view.",
            duration: 3000
          });
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    };
    
    const cleanup = checkAdminMode();
    return cleanup;
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
    <div className="bg-gradient-to-br from-[#0a0e17] to-[#131b2e] min-h-screen">
      <GlobalNavbar />
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <SonarScreener stockSymbol={currentSymbol} />
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
          
          {/* Account Summary */}
          <AccountSummary 
            account={account} 
            isLoading={isLoadingAccount} 
            orders={orders}
            initialInvestment={25000}
            isAdmin={isAdminMode}
          />
          
          {/* Stock Chart Panel */}
          <StockChartPanel onSymbolChange={handleSymbolChange} />
          
          {/* AI Market Analyst Panel */}
          <MarketAnalystPanel symbol={currentSymbol} />
          
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

          {/* Orders Table - Now with pagination */}
          <div className="overflow-x-auto">
            <OrdersTable 
              orders={orders} 
              isLoading={isLoadingOrders} 
              onRefresh={refreshOrders} 
              onCancelOrder={cancelOrder}
            />
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
          
          {/* Removed the Business Model Card / Subscription Plans section */}
        </div>
      </main>
    </div>
  );
};

export default TradingDashboard;
