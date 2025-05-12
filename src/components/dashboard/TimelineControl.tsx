
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useTimelineData } from '@/hooks/useTimelineData';

interface TimelineControlProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const TimelineControl: React.FC<TimelineControlProps> = ({
  selectedPeriod,
  onPeriodChange
}) => {
  const {
    timeValue,
    setTimeValue,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    currentTime,
    timelineEvents,
    currentEvent
  } = useTimelineData();

  // Available time periods
  const periods = ["1h", "4h", "24h", "7d", "30d", "YTD", "1y"];
  
  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Format the event markers from timelineEvents
  const eventMarkers = timelineEvents.map(event => {
    // Convert event timestamp to position percentage based on our current timeline
    const eventDate = new Date(event.timestamp);
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    
    // Simple linear mapping for visualization
    const position = ((eventDate.getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000)) * 100;
    
    return {
      id: event.id,
      position: position,
      label: event.title,
      impact: event.impact
    };
  });

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
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EST
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
        
        {/* Current event notification */}
        {currentEvent && (
          <div className={`mb-2 p-1.5 px-3 rounded-md text-xs animate-fade-in
            ${currentEvent.impact === 'high' ? 'bg-[#ff5252]/20 text-[#ff5252]' : 
              currentEvent.impact === 'medium' ? 'bg-[#7b61ff]/20 text-[#7b61ff]' : 
              'bg-[#00b8d4]/20 text-[#00b8d4]'
            }`}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{currentEvent.title}</div>
              <div className="text-[10px] uppercase">{currentEvent.impact} Impact</div>
            </div>
            {currentEvent.description && (
              <div className="text-[10px] mt-0.5 text-white/70">{currentEvent.description}</div>
            )}
          </div>
        )}
        
        {/* Event markers */}
        <div className="relative h-4 mb-1">
          {eventMarkers.map((marker) => (
            <div 
              key={marker.id}
              className={`absolute w-1.5 h-1.5 rounded-full cursor-pointer group
                ${marker.impact === 'high' ? 'bg-[#ff5252]' : 
                  marker.impact === 'medium' ? 'bg-[#7b61ff]' : 'bg-[#00b8d4]'}`}
              style={{ left: `${marker.position}%`, top: '50%', transform: 'translateY(-50%)' }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1.5 bg-[#1a2035] text-xs text-white px-2 py-1 rounded whitespace-nowrap transform -translate-x-1/2 left-1/2 transition-opacity border border-white/10 z-10">
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
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineControl;
