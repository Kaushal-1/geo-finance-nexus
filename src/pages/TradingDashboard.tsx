
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

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
      <header className="py-4 px-6 bg-black/30 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-teal-400 text-xl font-bold mr-8">GeoFinance</Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
            <Link to="/trading" className="text-white font-medium">Trading</Link>
            <Link to="/stock-compare" className="text-white/70 hover:text-white">Compare Stocks</Link>
            <Link to="/chat-research" className="text-white/70 hover:text-white">AI Research</Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading Dashboard</h1>
          
          {/* Moved buttons from navbar to here */}
          <div className="flex gap-2 w-full sm:w-auto">
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
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Account Summary - Moved to top */}
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
          
          {/* Business Model Card */}
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-2">Free Plan</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>Paper trading access</li>
                    <li>Basic stock analysis</li>
                    <li>5 watchlists max</li>
                    <li>Standard API limits</li>
                  </ul>
                  <div className="mt-3 text-center">
                    <span className="text-lg font-bold text-white">$0</span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-600/30 relative">
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-blue-600 text-xs text-white px-2 py-1 rounded-md">POPULAR</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Premium</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>All Free features</li>
                    <li>Enhanced Sonar analysis</li>
                    <li>Unlimited watchlists</li>
                    <li>Advanced alerts</li>
                    <li>Real-time data</li>
                  </ul>
                  <div className="mt-3 text-center">
                    <span className="text-lg font-bold text-white">$19.99</span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-600/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Pro Trader</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>All Premium features</li>
                    <li>Live trading (0.1% commission)</li>
                    <li>Advanced portfolio analysis</li>
                    <li>Dedicated API access</li>
                    <li>Priority support</li>
                  </ul>
                  <div className="mt-3 text-center">
                    <span className="text-lg font-bold text-white">$49.99</span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-center text-sm text-blue-300">
                This is a paper trading platform using Alpaca API. Upgrade for real trading capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TradingDashboard;
