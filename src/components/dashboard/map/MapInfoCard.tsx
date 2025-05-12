
import React from "react";

interface MapInfoCardProps {
  location?: string;
  marketCode?: string;
  marketCap?: string;
  dailyVolume?: string;
  performance?: string;
  isPositive?: boolean;
}

const MapInfoCard: React.FC<MapInfoCardProps> = ({
  location = "Global Markets",
  marketCode = "GLOBAL",
  marketCap = "$114.5T",
  dailyVolume = "$463.8B",
  performance = "+0.32%",
  isPositive = true
}) => {
  return (
    <div className="absolute left-4 bottom-4 z-10 bg-[#0a0e17]/80 backdrop-blur-md border border-white/10 rounded-lg p-4 text-white shadow-lg w-64">
      <div className="mb-2">
        <h3 className="text-lg font-bold">{location}</h3>
        <span className="text-xs font-mono text-gray-400">{marketCode}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Market Cap</span>
          <span className="font-mono">{marketCap}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Daily Volume</span>
          <span className="font-mono">{dailyVolume}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Performance</span>
          <span className={`font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {performance}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapInfoCard;
