
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
      
      <div className="relative w-36 h-20 mb-6">
        {/* Gauge background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg viewBox="0 0 100 50" className="w-full">
            {/* Semi-circular gradient background */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF436A" />
                <stop offset="50%" stopColor="#B49FFF" />
                <stop offset="100%" stopColor="#4062FF" />
              </linearGradient>
            </defs>
            
            {/* Background track */}
            <path 
              d="M10,50 A40,40 0 0,1 90,50" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8" 
              strokeLinecap="round"
            />
            
            {/* Colored gauge path */}
            <path 
              d="M10,50 A40,40 0 0,1 90,50" 
              fill="none" 
              stroke="url(#gaugeGradient)" 
              strokeWidth="8" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Needle */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-end">
          <div 
            className="origin-bottom transform transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${calculateNeedlePosition()}deg)` }}
          >
            <div className="h-16 w-0.5 bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white -mt-1 -ml-0.75"></div>
          </div>
        </div>

        {/* Value display */}
        <div className="absolute -bottom-8 left-0 w-full text-center">
          <span className={`text-xl font-bold ${getValueColor()}`}>{value}</span>
        </div>
      </div>

      {/* Counts display */}
      <div className="flex justify-between w-full text-sm mt-2">
        <div className="text-center">
          <div className="text-red-500">Sell</div>
          <div className="font-semibold">{sellCount}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Neutral</div>
          <div className="font-semibold">{neutralCount}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-500">Buy</div>
          <div className="font-semibold">{buyCount}</div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicatorGauge;
