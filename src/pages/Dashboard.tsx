
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapVisualization from "@/components/dashboard/MapVisualization";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useTimelineData } from "@/hooks/useTimelineData";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowRightLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import NewsPanel from "@/components/dashboard/NewsPanel";
import GlobalStockNews from "@/components/dashboard/GlobalStockNews";

const Dashboard = () => {
  const [is3DView] = useState(true); // Keep as true, but no longer toggleable
  const { selectedPeriod, setSelectedPeriod } = useTimelineData();
  const navigate = useNavigate();

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
        
        {/* Updated Trading View Widget */}
        <div className="h-20 rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm overflow-hidden">
          <div className="tradingview-widget-container h-full">
            <div className="tradingview-widget-container__widget h-full"></div>
            <div className="tradingview-widget-copyright hidden md:block">
              <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                <span className="text-blue-400 text-xs">Track all markets on TradingView</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Global Stock News Section */}
        <div className="flex-1 min-h-[200px]">
          <GlobalStockNews />
        </div>
      </div>
      
      {/* Updated TradingView Widget */}
      <UpdatedTradingViewWidget />
    </div>
  );
};

// Updated component for TradingView Widget with the new configuration
const UpdatedTradingViewWidget = () => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "proName": "FOREXCOM:SPXUSD",
          "title": "S&P 500 Index"
        },
        {
          "proName": "FOREXCOM:NSXUSD",
          "title": "US 100 Cash CFD"
        },
        {
          "description": "TESLA",
          "proName": "NASDAQ:TSLA"
        },
        {
          "description": "UBER",
          "proName": "NYSE:UBER"
        },
        {
          "description": "RELIANCE",
          "proName": "NASDAQ:RELI"
        },
        {
          "description": "APPLE",
          "proName": "NASDAQ:AAPL"
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "regular",
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
