
import React from "react";

interface TechnicalGaugeProps {
  value: string;
  percentage: number;
  colorClass?: string;
}

const TechnicalGauge: React.FC<TechnicalGaugeProps> = ({
  value,
  percentage,
  colorClass = "text-gray-300"
}) => {
  // Calculate gauge angle (from -90 to 90 degrees)
  const calculateGaugeAngle = () => {
    // Map percentage (0-100) to angle (-90 to 90)
    return (percentage / 100 * 180) - 90;
  };

  // Determine color based on percentage
  const getGradientColor = () => {
    if (percentage < 30) return "from-red-500 to-orange-400";
    if (percentage < 50) return "from-orange-400 to-yellow-400";
    if (percentage < 70) return "from-yellow-400 to-green-400";
    return "from-green-400 to-teal-400";
  };

  // Get needle color
  const getNeedleColor = () => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 50) return "bg-orange-400";
    if (percentage < 70) return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-16 relative">
        {/* Gauge background */}
        <div className="w-full h-full overflow-hidden">
          <div className="absolute left-0 bottom-0 w-full h-full">
            <div className="relative w-full h-full">
              {/* Gradient arc background */}
              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-20 rounded-t-full"></div>
              
              {/* Glass effect overlay */}
              <div className="absolute bottom-0 left-0 w-full h-full bg-white/5 rounded-t-full backdrop-blur-[1px]"></div>
              
              {/* Tick marks */}
              <div className="absolute bottom-0 left-1/4 h-2 w-0.5 bg-white/40"></div>
              <div className="absolute bottom-0 left-1/2 h-3 w-0.5 bg-white/40"></div>
              <div className="absolute bottom-0 left-3/4 h-2 w-0.5 bg-white/40"></div>
              
              {/* Needle */}
              <div 
                className={`absolute bottom-0 left-1/2 h-16 w-1 ${getNeedleColor()} origin-bottom transform transition-transform duration-1000 ease-out shadow-lg`}
                style={{ transform: `translateX(-50%) rotate(${calculateGaugeAngle()}deg)` }}
              >
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${getNeedleColor()} rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]`}></div>
              </div>
              
              {/* Glow effect for needle base */}
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 ${getNeedleColor()} rounded-full opacity-20 blur-md`}></div>
              
              {/* Needle base */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/80 rounded-full border border-white/20 shadow-inner"></div>
            </div>
          </div>
        </div>
        
        {/* Value text */}
        <div className={`absolute -bottom-1 left-0 w-full text-center font-medium ${colorClass}`}>
          {value}
        </div>
      </div>
      
      {/* Percentage display */}
      <div className={`text-sm mt-2 font-medium ${colorClass}`}>
        <span className={`inline-block px-2 py-0.5 rounded bg-gradient-to-r ${getGradientColor()} bg-opacity-20 text-white`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default TechnicalGauge;
