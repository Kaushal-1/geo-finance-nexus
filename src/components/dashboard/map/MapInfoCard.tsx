
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
    <div className="absolute bottom-4 left-4 max-w-sm bg-black/40 backdrop-blur-sm p-3 rounded-md border border-white/10 text-white z-10">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">{location}</h3>
        <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{marketCode}</span>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Market Cap:</span>
          <span>{marketCap}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Daily Volume:</span>
          <span>{dailyVolume}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Performance:</span>
          <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
            {performance}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapInfoCard;
