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
    return percentage / 100 * 180 - 90;
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
  return <div className="flex flex-col items-center">
      <div className="w-32 h-16 relative">
        {/* Gauge background */}
        <div className="w-full h-full overflow-hidden">
          <div className="absolute left-0 bottom-0 w-full h-full">
            <div className="relative w-full h-full">
              {/* Simple gauge background with gradient */}
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <defs>
                  <linearGradient id="simpleGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF436A" />
                    <stop offset="50%" stopColor="#B49FFF" />
                    <stop offset="100%" stopColor="#4062FF" />
                  </linearGradient>
                </defs>
                
                {/* Background track */}
                <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />
                
                {/* Colored gauge path */}
                <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="url(#simpleGaugeGradient)" strokeWidth="6" strokeLinecap="round" />
              </svg>
              
              {/* Simple needle */}
              <div className="absolute bottom-0 left-1/2 h-14 w-0.5 bg-white origin-bottom transform transition-transform duration-700 ease-out" style={{
              transform: `translateX(-50%) rotate(${calculateGaugeAngle()}deg)`
            }}>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Value text with improved readability */}
        <div className="absolute -bottom-7 left-0 w-full text-center">
          <span className="text-sm">
            {value}
          </span>
        </div>
      </div>
      
      {/* Enhanced percentage display with better visibility */}
      <div className="mt-5 text-sm">
        <span className="text-xs">
          {percentage}%
        </span>
      </div>
    </div>;
};
export default TechnicalGauge;