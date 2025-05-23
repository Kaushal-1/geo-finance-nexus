
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapVisualization from "@/components/dashboard/MapVisualization";
import GlobalNavbar from "@/components/shared/GlobalNavbar";
import { useTimelineData } from "@/hooks/useTimelineData";
import { Button } from "@/components/ui/button";
import { Globe, Newspaper } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewsPanel from "@/components/dashboard/NewsPanel";
import GlobalStockNews from "@/components/dashboard/GlobalStockNews";

const Dashboard = () => {
  const [is3DView] = useState(true); // Keep as true, but no longer toggleable
  const { selectedPeriod, setSelectedPeriod } = useTimelineData();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <GlobalNavbar />

      <div className="flex flex-col h-[calc(100vh-120px)] p-4 gap-4">
        {/* Main Content - Interactive Map with fixed height */}
        <div className="h-[100vh] flex flex-col relative">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm">
            <MapVisualization />

            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {/* Financial News Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700" size="sm">
                    <Newspaper className="mr-2 h-4 w-4" /> Financial News
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full sm:w-[400px] bg-[#0a0e17] border-r border-white/10"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white">
                      Financial News
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 h-[calc(100vh-100px)] overflow-auto">
                    <NewsPanel />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Global Stock News Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                    <Globe className="mr-2 h-4 w-4" /> Global Stock News
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[90vw] max-w-[500px] bg-[#0a0e17] border border-white/10 rounded-lg p-3 shadow-lg"
                  sideOffset={5}
                  align="start"
                >
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    <GlobalStockNews />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Remove the original GlobalStockNews section */}
      </div>
    </div>
  );
};

// Optional: TradingView Widget component (commented out)
/*
const UpdatedTradingViewWidget = () => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
        { description: "TESLA", proName: "NASDAQ:TSLA" },
        { description: "UBER", proName: "NYSE:UBER" },
        { description: "RELIANCE", proName: "NASDAQ:RELI" },
        { description: "APPLE", proName: "NASDAQ:AAPL" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "regular",
      colorTheme: "dark",
      locale: "en"
    });

    const container = document.querySelector('.tradingview-widget-container__widget');
    if (container) container.appendChild(script);

    return () => {
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="h-20 rounded-xl border border-white/10 bg-[#1a2035]/80 backdrop-blur-sm overflow-hidden">
      <div className="tradingview-widget-container h-full">
        <div className="tradingview-widget-container__widget h-full"></div>
      </div>
    </div>
  );
};
*/

export default Dashboard;
