
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface TimelineControlProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const TimelineControl: React.FC<TimelineControlProps> = ({
  selectedPeriod,
  onPeriodChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeValue, setTimeValue] = useState([50]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Available time periods
  const periods = ["1h", "4h", "24h", "7d", "30d", "YTD", "1y"];
  
  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Event markers for the timeline - positions are percentages
  const eventMarkers = [
    { position: 15, label: "Market Open" },
    { position: 32, label: "Fed Announcement" },
    { position: 68, label: "Earnings Report" },
    { position: 85, label: "Market Close" },
  ];

  return (
    <div className="h-full bg-[#1a2035]/80 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon"
              onClick={togglePlayback}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 mr-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a0aec0]">Speed:</span>
              <div className="flex">
                {[1, 2, 5, 10].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-teal text-white'
                        : 'text-[#a0aec0] hover:bg-white/10'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="font-mono text-lg text-white">
            May 12, 2025 • 14:30 EST
          </div>
          
          <div className="flex items-center gap-1">
            {periods.map(period => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-teal text-white'
                    : 'text-[#a0aec0] hover:bg-white/10'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Event markers */}
        <div className="relative h-4 mb-1">
          {eventMarkers.map((marker, index) => (
            <div 
              key={index}
              className="absolute w-1 h-1 bg-teal rounded-full cursor-pointer group"
              style={{ left: `${marker.position}%`, top: '50%', transform: 'translateY(-50%)' }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-[#1a2035] text-xs text-white px-2 py-1 rounded whitespace-nowrap transform -translate-x-1/2 left-1/2 transition-opacity">
                {marker.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline slider */}
        <div className="flex-1 flex items-center">
          <Slider
            value={timeValue}
            onValueChange={setTimeValue}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineControl;
