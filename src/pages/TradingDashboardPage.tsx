
import React, { useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TradingDashboard from "@/components/trading/TradingDashboard";
import { useToast } from "@/components/ui/use-toast";

const TradingDashboardPage = () => {
  const { toast } = useToast();
  
  // Initial load toast
  useEffect(() => {
    toast({
      title: "Trading Dashboard loaded",
      description: "Welcome to the GeoFinance Trading Dashboard with Alpaca Paper Trading integration.",
      duration: 5000
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <DashboardHeader />
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Trading Dashboard</h1>
        <div className="h-full overflow-auto rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm p-4 mt-0">
          <TradingDashboard />
        </div>
      </div>
    </div>
  );
};

export default TradingDashboardPage;
