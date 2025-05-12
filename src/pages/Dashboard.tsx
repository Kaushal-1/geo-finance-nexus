
import React, { useState, useEffect } from "react";
import MapVisualization from "@/components/dashboard/MapVisualization";
import NewsPanel from "@/components/dashboard/NewsPanel";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/components/ui/use-toast";
import { useTimelineData } from "@/hooks/useTimelineData";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Newspaper } from "lucide-react";
import TradingViewWidget from "@/components/dashboard/TradingViewWidget";

const Dashboard = () => {
  const [is3DView, setIs3DView] = useState(true);
  const { toast } = useToast();
  const { selectedPeriod, setSelectedPeriod } = useTimelineData();

  // Initial load toast
  useEffect(() => {
    toast({
      title: "Dashboard loaded",
      description: "Welcome to the GeoFinance dashboard with real-time Finnhub API data integration.",
      duration: 5000
    });
  }, []);
  
  const handleViewToggle = () => {
    setIs3DView(prev => !prev);
    toast({
      title: `Switched to ${!is3DView ? "3D Globe" : "2D Map"} view`,
      duration: 2000
    });
  };
  
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    toast({
      title: `Timeline period updated: ${period}`,
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-120px)] gap-6">
        {/* Main Content - Interactive Map with floating News button */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm">
          <MapVisualization is3DView={is3DView} onViewToggle={handleViewToggle} />
          
          {/* Floating News Button */}
          <div className="absolute top-4 right-4 z-10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="rounded-full shadow-lg">
                  <Newspaper className="mr-2 h-4 w-4" />
                  Financial News
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[540px] p-0 bg-[#1a2035]/95 border-white/10">
                <NewsPanel />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* TradingView Widget */}
        <div className="h-28 bg-[#1a2035]/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <TradingViewWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
