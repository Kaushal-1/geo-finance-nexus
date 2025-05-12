
import React from "react";
import { Switch } from "@/components/ui/switch";
import Globe from "@/components/Globe";
import { Skeleton } from "@/components/ui/skeleton";

interface MapVisualizationProps {
  is3DView: boolean;
  onViewToggle: () => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ 
  is3DView, 
  onViewToggle 
}) => {
  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div className="absolute inset-0 overflow-hidden">
        {is3DView ? (
          <Globe className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a2035]">
            <Skeleton className="w-4/5 h-4/5 rounded-xl bg-white/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/50 text-lg">2D Map View (Coming Soon)</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-[#1a2035]/80 backdrop-blur-sm rounded-lg p-2 border border-white/10">
          <div className="flex items-center gap-2 p-1">
            <span className="text-xs text-[#a0aec0]">2D</span>
            <Switch 
              checked={is3DView} 
              onCheckedChange={onViewToggle}
              className="data-[state=checked]:bg-teal" 
            />
            <span className="text-xs text-[#a0aec0]">3D</span>
          </div>
        </div>

        <div className="bg-[#1a2035]/80 backdrop-blur-sm rounded-lg p-2 border border-white/10">
          <div className="flex flex-col gap-2">
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 2-5.5 9 5.5 9 5.5-9z" />
                <path d="m2 10 10-8 10 8-10 8z" />
              </svg>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#1a2035]/80 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-medium text-[#a0aec0]">MARKET PERFORMANCE</h4>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00e676]"></span>
            <span className="text-xs text-white">Positive Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5252]"></span>
            <span className="text-xs text-white">Negative Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#7b61ff]"></span>
            <span className="text-xs text-white">High Activity</span>
          </div>
        </div>
      </div>

      {/* Floating Info Card (Example) */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a2035]/90 backdrop-blur-lg rounded-lg p-3 border border-teal/30 shadow-lg shadow-teal/10 w-64 animate-fade-in" style={{zIndex: 20}}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-white">New York</h3>
          <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded-full">NYSE</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-[#a0aec0]">Market Cap</span>
            <span className="text-xs font-mono text-white">$26.2T</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[#a0aec0]">Daily Volume</span>
            <span className="text-xs font-mono text-white">$212.5B</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[#a0aec0]">Performance</span>
            <span className="text-xs font-mono text-[#00e676]">+1.23%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
