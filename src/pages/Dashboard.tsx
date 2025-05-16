
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MapVisualization from "@/components/dashboard/MapVisualization";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/components/ui/use-toast";
import { useTimelineData } from "@/hooks/useTimelineData";
import { useNewsData } from "@/hooks/useNewsData";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowRightLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import NewsPanel from "@/components/dashboard/NewsPanel";
import GlobalStockNews from "@/components/dashboard/GlobalStockNews";

const Dashboard = () => {
  const [is3DView] = useState(true); // Keep as true, but no longer toggleable
  const { toast } = useToast();
  const { selectedPeriod, setSelectedPeriod } = useTimelineData();
  const navigate = useNavigate();

  // Initial load toast
  useEffect(() => {
    toast({
      title: "Dashboard loaded",
      description: "Welcome to the GeoFinance dashboard with real-time Finnhub API data integration.",
      duration: 5000
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <DashboardHeader />
      
      <div className="flex flex-col h-[calc(100vh-120px)] p-4 gap-4">
        {/* Main Content - Interactive Map with fixed height */}
        <div className="h-[55vh] flex flex-col relative">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm">
            <MapVisualization />
            
            <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2">
              {/* Financial News Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    <Newspaper className="mr-2 h-4 w-4" /> Financial News
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] bg-[#0a0e17] border-r border-white/10">
                  <SheetHeader>
                    <SheetTitle className="text-white">Financial News</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 h-[calc(100vh-100px)] overflow-auto">
                    <NewsPanel />
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Stock Compare Button */}
              <Button 
                className="bg-violet-600 hover:bg-violet-700"
                size="sm"
                onClick={() => navigate('/stock-compare')}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Compare Stocks
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Market Performance - TradingView Widget */}
        <div className="h-20 rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm overflow-hidden">
          <div className="tradingview-widget-container h-full">
            <div className="tradingview-widget-container__widget h-full"></div>
          </div>
        </div>
        
        {/* Global Stock News Section */}
        <div className="flex-1 min-h-[200px]">
          <GlobalStockNews />
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
