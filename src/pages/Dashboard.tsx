
import React, { useState } from "react";
import MapVisualization from "@/components/dashboard/MapVisualization";
import MarketPerformancePanel from "@/components/dashboard/MarketPerformancePanel";
import NewsPanel from "@/components/dashboard/NewsPanel";
import TimelineControl from "@/components/dashboard/TimelineControl";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [is3DView, setIs3DView] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const { toast } = useToast();

  const handleViewToggle = () => {
    setIs3DView(prev => !prev);
    toast({
      title: `Switched to ${!is3DView ? "3D Globe" : "2D Map"} view`,
      duration: 2000,
    });
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    toast({
      title: `Timeline period updated: ${period}`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <DashboardHeader />
      
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] p-4 gap-4">
        {/* Left Sidebar - News Panel */}
        <div className="w-full md:w-80 lg:w-96 h-full md:h-full overflow-hidden flex-shrink-0 order-2 md:order-1">
          <NewsPanel />
        </div>
        
        {/* Main Content - Interactive Map */}
        <div className="flex-1 h-full flex flex-col order-1 md:order-2">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm">
            <MapVisualization is3DView={is3DView} onViewToggle={handleViewToggle} />
          </div>
        </div>
        
        {/* Right Sidebar - Market Performance */}
        <div className="w-full md:w-80 lg:w-96 h-full md:h-full overflow-hidden flex-shrink-0 order-3">
          <MarketPerformancePanel />
        </div>
      </div>
      
      {/* Bottom Timeline Control */}
      <div className="h-20 px-4 pb-4">
        <TimelineControl 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={handlePeriodChange} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
