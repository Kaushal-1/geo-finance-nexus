
import React from "react";
import { Switch } from "@/components/ui/switch";

interface MapControlsProps {
  is3DView: boolean;
  onViewToggle: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ is3DView, onViewToggle }) => {
  return (
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
  );
};

export default MapControls;
