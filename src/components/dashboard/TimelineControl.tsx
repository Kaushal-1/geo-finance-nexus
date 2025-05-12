
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
    const position = (eventDate.getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000) * 100;
    return {
      id: event.id,
      position: position,
      label: event.title,
      impact: event.impact
    };
  });
  
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {periods.map(period => (
            <Button 
              key={period}
              size="sm"
              variant={selectedPeriod === period ? "default" : "outline"}
              onClick={() => onPeriodChange(period)}
              className="px-2 py-1 text-xs"
            >
              {period}
            </Button>
          ))}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={togglePlayback}
          className="gap-1"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
      
      <div className="relative mt-2">
        <Slider
          value={timeValue}
          onValueChange={setTimeValue}
          max={100}
          step={1}
        />
        
        {/* Event markers */}
        {eventMarkers.map(marker => (
          <div 
            key={marker.id}
            className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer
              ${marker.impact === 'high' ? 'bg-red-500' : 
                marker.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ left: `${marker.position}%`, top: '50%' }}
            title={marker.label}
          />
        ))}
      </div>
      
      {/* Current event display */}
      {currentEvent && (
        <div className="text-xs text-gray-400 mt-1">
          {new Date(currentEvent.timestamp).toLocaleTimeString()} - {currentEvent.title}
        </div>
      )}
    </div>
  );
};

export default TimelineControl;
