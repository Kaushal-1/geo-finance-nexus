
import { useState, useEffect, useCallback } from 'react';
import { timelineEvents, getTimelineEventForPosition, TimelineEvent } from '@/services/timelineService';

export function useTimelineData() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timeValue, setTimeValue] = useState<number[]>([50]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('24h');
  const [currentEvent, setCurrentEvent] = useState<TimelineEvent | null>(null);

  // Calculate start and end time based on the selected period
  const getTimeRange = useCallback(() => {
    const end = new Date();
    let start = new Date();
    
    switch (selectedPeriod) {
      case '1h':
        start.setTime(end.getTime() - 60 * 60 * 1000);
        break;
      case '4h':
        start.setTime(end.getTime() - 4 * 60 * 60 * 1000);
        break;
      case '24h':
        start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start.setTime(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start.setTime(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'YTD':
        start = new Date(end.getFullYear(), 0, 1);
        break;
      case '1y':
        start.setTime(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return { start, end };
  }, [selectedPeriod]);

  // Get visible events based on current time range
  const getVisibleEvents = useCallback(() => {
    const { start, end } = getTimeRange();
    
    return timelineEvents.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime >= start.getTime() && eventTime <= end.getTime();
    });
  }, [getTimeRange]);

  // Handle slider time change
  const handleTimeChange = useCallback((newTimeValue: number[]) => {
    setTimeValue(newTimeValue);
    const { start, end } = getTimeRange();
    const range = end.getTime() - start.getTime();
    const newTime = new Date(start.getTime() + (range * newTimeValue[0] / 100));
    setCurrentTime(newTime);
  }, [getTimeRange]);

  // Check for events at the current position
  useEffect(() => {
    const event = getTimelineEventForPosition(timeValue[0]);
    setCurrentEvent(event);
  }, [timeValue]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const { end } = getTimeRange();
    const interval = setInterval(() => {
      setTimeValue(prev => {
        const newValue = [Math.min(prev[0] + 0.2 * playbackSpeed, 100)];
        if (newValue[0] >= 100) {
          setIsPlaying(false);
        }
        return newValue;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, getTimeRange]);

  // When period changes, reset the time value
  useEffect(() => {
    setTimeValue([50]);
  }, [selectedPeriod]);

  return {
    currentTime,
    timeValue,
    setTimeValue: handleTimeChange,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    selectedPeriod,
    setSelectedPeriod,
    timelineEvents: getVisibleEvents(),
    currentEvent
  };
}
