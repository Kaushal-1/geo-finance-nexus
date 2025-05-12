
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
  location = "New York",
  marketCode = "NYSE",
  marketCap = "$26.2T",
  dailyVolume = "$212.5B",
  performance = "+1.23%",
  isPositive = true
}) => {
  return (
    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a2035]/90 backdrop-blur-lg rounded-lg p-3 border border-teal/30 shadow-lg shadow-teal/10 w-64 animate-fade-in" style={{zIndex: 20}}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-white">{location}</h3>
        <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded-full">{marketCode}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-[#a0aec0]">Market Cap</span>
          <span className="text-xs font-mono text-white">{marketCap}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-[#a0aec0]">Daily Volume</span>
          <span className="text-xs font-mono text-white">{dailyVolume}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-[#a0aec0]">Performance</span>
          <span className={`text-xs font-mono text-[${isPositive ? '#00e676' : '#ff5252'}]`}>
            {performance}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapInfoCard;
