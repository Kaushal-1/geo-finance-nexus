
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

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-16 relative">
        {/* Gauge background */}
        <div className="w-full h-full overflow-hidden">
          <div className="absolute left-0 bottom-0 w-full h-full">
            <div className="relative w-full h-full">
              {/* Red zone (left) */}
              <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-red-500 to-yellow-500 opacity-20 rounded-tl-full"></div>
              
              {/* Yellow zone (middle) */}
              <div className="absolute bottom-0 left-1/3 w-1/3 h-full bg-gradient-to-r from-yellow-500 to-lime-500 opacity-20"></div>
              
              {/* Green zone (right) */}
              <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-r from-lime-500 to-blue-500 opacity-20 rounded-tr-full"></div>
              
              {/* Needle */}
              <div 
                className="absolute bottom-0 left-1/2 h-16 w-0.5 bg-white origin-bottom transform transition-transform duration-1000 ease-out"
                style={{ transform: `translateX(-50%) rotate(${calculateGaugeAngle()}deg)` }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-glow"></div>
              </div>
              
              {/* Shadow for needle base */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full opacity-20 filter blur-md"></div>
              
              {/* Needle base */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Value text */}
        <div className={`absolute bottom-0 left-0 w-full text-center ${colorClass}`}>
          {value}
        </div>
      </div>
      
      {/* Percentage display */}
      <div className={`text-sm mt-1 ${colorClass}`}>
        {percentage}% {value}
      </div>
    </div>
  );
};

export default TechnicalGauge;
