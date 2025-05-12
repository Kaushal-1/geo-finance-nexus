
import React from "react";

const MapLegend: React.FC = () => {
  return (
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
  );
};

export default MapLegend;
