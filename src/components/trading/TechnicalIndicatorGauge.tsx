
import React from "react";

// Define the props interface with strict typing for value
interface TechnicalIndicatorGaugeProps {
  title: string;
  value: "Strong buy" | "Buy" | "Neutral" | "Sell" | "Strong sell";
  sellCount: number;
  neutralCount: number;
  buyCount: number;
}

const TechnicalIndicatorGauge: React.FC<TechnicalIndicatorGaugeProps> = ({
  title,
  value,
  sellCount,
  neutralCount,
  buyCount,
}) => {
  // Calculate the needle position (from -90 to 90 degrees)
  const calculateNeedlePosition = () => {
    switch (value) {
      case "Strong sell": return -75;
      case "Sell": return -40;
      case "Neutral": return 0;
      case "Buy": return 40;
      case "Strong buy": return 75;
      default: return 0;
    }
  };

  // Determine value color
  const getValueColor = () => {
    switch (value) {
      case "Strong sell":
      case "Sell":
        return "text-red-500";
      case "Neutral":
        return "text-gray-400";
      case "Buy":
      case "Strong buy":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      
      <div className="relative w-36 h-20 mb-4">
        {/* Gauge background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg viewBox="0 0 100 50" className="w-full">
            {/* Background arc */}
            <path 
              d="M10,50 A40,40 0 0,1 90,50" 
              fill="none" 
              stroke="#1a1f2c"
              strokeWidth="10" 
              strokeLinecap="round"
            />
            {/* Red section (Sell) */}
            <path 
              d="M10,50 A40,40 0 0,1 35,25" 
              fill="none" 
              stroke="#ff4d6a" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
            {/* Gray section (Neutral) */}
            <path 
              d="M35,25 A40,40 0 0,1 65,25" 
              fill="none" 
              stroke="#6e6e6e" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
            {/* Blue section (Buy) */}
            <path 
              d="M65,25 A40,40 0 0,1 90,50" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Needle */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-end">
          <div 
            className="origin-bottom transform transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${calculateNeedlePosition()}deg)` }}
          >
            <div className="h-16 w-1 bg-white"></div>
            <div className="h-3 w-3 rounded-full bg-white -mt-1.5 ml-[-5px]"></div>
          </div>
        </div>

        {/* Value text */}
        <div className="absolute bottom-[-24px] left-0 w-full text-center">
          <span className={`text-base font-bold ${getValueColor()}`}>{value}</span>
        </div>
      </div>

      {/* Counts display */}
      <div className="flex justify-between w-full text-sm mt-2">
        <div className="text-center">
          <div className="text-red-500">Sell</div>
          <div>{sellCount}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Neutral</div>
          <div>{neutralCount}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-500">Buy</div>
          <div>{buyCount}</div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicatorGauge;
