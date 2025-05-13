
import React, { useState, useEffect } from "react";
import MapVisualization from "@/components/dashboard/MapVisualization";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/components/ui/use-toast";
import { useTimelineData } from "@/hooks/useTimelineData";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import NewsPanel from "@/components/dashboard/NewsPanel";

const Dashboard = () => {
  const [is3DView, setIs3DView] = useState(true);
  const { toast } = useToast();
  const { selectedPeriod, setSelectedPeriod } = useTimelineData();

  // Initial load toast
  useEffect(() => {
    toast({
      title: "Dashboard loaded",
      description: "Welcome to the GeoFinance Market Map dashboard with real-time Finnhub API data integration.",
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <DashboardHeader />
      
      <div className="p-4">
        <div className="mb-4">
          {/* Main Content - Interactive Map */}
          <div className="flex-1 h-full flex flex-col relative">
            <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm">
              <MapVisualization is3DView={is3DView} onViewToggle={handleViewToggle} />
              
              {/* Financial News Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    className="absolute top-4 left-4 bg-teal-600 hover:bg-teal-700 z-10"
                    size="sm"
                  >
                    <Newspaper className="mr-2 h-4 w-4" /> Financial News
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] bg-[#0a0e17] border-r border-white/10">
                  <SheetHeader>
                    <SheetTitle className="text-white">Financial News</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 h-[calc(100vh-100px)] overflow-hidden">
                    <NewsPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Bottom Market Performance - TradingView Widget */}
          <div className="h-20 mt-4 rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm overflow-hidden">
            <div className="tradingview-widget-container h-full">
              <div className="tradingview-widget-container__widget h-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* TradingView Widget Script */}
      <TradingViewWidget />
    </div>
  );
};

// Separate component for TradingView Widget to handle script injection
const TradingViewWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "description": "Sensex",
          "proName": "INDEX:SENSEX"
        },
        {
          "description": "Bitcoin",
          "proName": "BINANCE:BTCUSDT"
        },
        {
          "description": "Nvidia",
          "proName": "NASDAQ:NVDA"
        },
        {
          "description": "Google",
          "proName": "NASDAQ:GOOGL"
        },
        {
          "description": "SBI",
          "proName": "NSE:SBIN"
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": "en"
    });
    
    const widgetContainer = document.querySelector('.tradingview-widget-container__widget');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }
    
    return () => {
      if (widgetContainer && script.parentNode === widgetContainer) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);
  
  return null;
};

export default Dashboard;
