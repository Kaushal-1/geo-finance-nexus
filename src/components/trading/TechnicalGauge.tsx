
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
              {/* Gradient arc background with better contrast */}
              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-25 rounded-t-full"></div>
              
              {/* Glass effect overlay with improved depth */}
              <div className="absolute bottom-0 left-0 w-full h-full bg-white/5 rounded-t-full backdrop-blur-[2px] shadow-inner"></div>
              
              {/* Enhanced tick marks */}
              <div className="absolute bottom-0 left-1/5 h-2 w-0.5 bg-white/50"></div>
              <div className="absolute bottom-0 left-2/5 h-2 w-0.5 bg-white/50"></div>
              <div className="absolute bottom-0 left-3/5 h-2 w-0.5 bg-white/50"></div>
              <div className="absolute bottom-0 left-4/5 h-2 w-0.5 bg-white/50"></div>
              
              {/* Center tick mark */}
              <div className="absolute bottom-0 left-1/2 h-3 w-0.5 bg-white/60"></div>
              
              {/* Enhanced needle with glow effect */}
              <div 
                className={`absolute bottom-0 left-1/2 h-16 w-1.5 ${getNeedleColor()} origin-bottom transform transition-transform duration-1000 ease-out rounded-full shadow-lg`}
                style={{ transform: `translateX(-50%) rotate(${calculateGaugeAngle()}deg)` }}
              >
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${getNeedleColor()} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)]`}></div>
              </div>
              
              {/* Enhanced glow effect for needle base */}
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 ${getNeedleColor()} rounded-full opacity-30 blur-md`}></div>
              
              {/* Enhanced needle base with inner shadow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full border border-white/30 shadow-inner"></div>
            </div>
          </div>
        </div>
        
        {/* Value text with improved readability */}
        <div className={`absolute -bottom-1 left-0 w-full text-center font-medium ${colorClass} text-shadow`}>
          {value}
        </div>
      </div>
      
      {/* Enhanced percentage display with animated border */}
      <div className={`text-sm mt-2 font-medium ${colorClass}`}>
        <span className={`inline-block px-2.5 py-1 rounded-md bg-gradient-to-r ${getGradientColor()} bg-opacity-20 text-white border border-white/10`}>
          {percentage}%
        </span>
      </div>
      
      {/* Fixed the style tag to use proper React styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .text-shadow {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      `}} />
    </div>
  );
};

export default TechnicalGauge;
