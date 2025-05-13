
import React, { useState } from "react";
import AccountSummary from "./AccountSummary";
import PositionsTable from "./PositionsTable";
import OrdersTable from "./OrdersTable";
import TradePanel from "./TradePanel";
import WatchlistManager from "./WatchlistManager";

const TradingDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleOrderPlaced = () => {
    // Trigger a refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Left Column */}
      <div className="space-y-4">
        <AccountSummary key={`account-${refreshTrigger}`} />
        <TradePanel onOrderPlaced={handleOrderPlaced} />
      </div>
      
      {/* Middle Column */}
      <div className="xl:col-span-2 space-y-4">
        <PositionsTable key={`positions-${refreshTrigger}`} />
        <OrdersTable key={`orders-${refreshTrigger}`} />
      </div>
      
      {/* Right Column (on smaller screens it will be below) */}
      <div className="xl:col-span-3">
        <WatchlistManager key={`watchlists-${refreshTrigger}`} />
      </div>
    </div>
  );
};

export default TradingDashboard;
