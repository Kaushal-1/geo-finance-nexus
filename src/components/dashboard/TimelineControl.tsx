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
  return;
};
export default TimelineControl;