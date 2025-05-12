
import React, { useState } from "react";
import { Play, Pause, ChevronUp, ChevronDown } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const TimelineControl = () => {
  const { 
    timelineDate, 
    setTimelineDate, 
    timelineEvents,
    isTimelinePlaying,
    toggleTimelinePlayback
  } = useDashboard();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create date range for timeline (30 days back from today)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // Calculate current position in timeline (0-100)
  const totalRange = endDate.getTime() - startDate.getTime();
  const currentPosition = ((timelineDate.getTime() - startDate.getTime()) / totalRange) * 100;
  
  const handleSliderChange = (value: number[]) => {
    const newPosition = value[0];
    const newTimestamp = startDate.getTime() + (totalRange * (newPosition / 100));
    setTimelineDate(new Date(newTimestamp));
  };
  
  // Format events for display on timeline
  const formattedEvents = timelineEvents.map(event => {
    const eventPosition = ((event.date.getTime() - startDate.getTime()) / totalRange) * 100;
    return {
      ...event,
      position: eventPosition
    };
  }).filter(event => event.position >= 0 && event.position <= 100);
  
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* Expand/collapse button */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -top-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-full bg-black/40 border border-white/10 p-0 hover:bg-black/60"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className={`bg-black/40 backdrop-blur-md border-t border-white/10 transition-all duration-300 overflow-hidden ${
        isExpanded ? "max-h-60" : "max-h-14"
      }`}>
        {/* Simple timeline control always visible */}
        <div className="h-14 px-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 rounded-full p-0 mr-3 ${
              isTimelinePlaying ? "bg-white/10 text-white" : "text-white/70"
            }`}
            onClick={toggleTimelinePlayback}
          >
            {isTimelinePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="flex-1 relative">
            {/* Event markers */}
            <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 pointer-events-none h-8">
              {formattedEvents.map(event => (
                <div 
                  key={event.id}
                  className="absolute w-3 h-3 bg-teal rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                  style={{ left: `${event.position}%` }}
                  title={event.title}
                >
                  <div className="absolute w-5 h-5 bg-teal/30 rounded-full -left-1 -top-1 animate-ping" />
                </div>
              ))}
            </div>
            
            <Slider 
              value={[currentPosition]} 
              min={0} 
              max={100} 
              step={0.1}
              onValueChange={handleSliderChange}
              className="timeline-slider"
            />
          </div>
          
          <div className="ml-3 font-mono text-sm text-white/90 min-w-[90px] text-right">
            {format(timelineDate, "MMM dd yyyy")}
          </div>
        </div>
        
        {/* Expanded timeline section */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-4">
            {formattedEvents.slice(0, 3).map(event => (
              <div 
                key={event.id} 
                className={`p-3 rounded-lg border ${
                  event.impact > 0 ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
                } text-white`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-medium">{event.title}</div>
                  <div className="text-xs opacity-60">{format(event.date, "MMM dd")}</div>
                </div>
                <p className="text-xs opacity-80 line-clamp-2">{event.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Market Impact</span>
                    <span className={event.impact > 0 ? "text-green-400" : "text-red-400"}>
                      {event.impact > 0 ? "+" : ""}{event.impact.toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(event.impact) * 10}
                    className={`h-1.5 ${event.impact > 0 ? "bg-green-900/30" : "bg-red-900/30"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Custom styling */}
      <style jsx global>{`
        .timeline-slider .absolute {
          background-color: rgba(0, 184, 212, 0.7) !important;
        }
        
        .timeline-slider [data-orientation=horizontal] {
          height: 4px;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .timeline-slider [role=slider] {
          background-color: #00b8d4;
          border: 2px solid white;
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
};

export default TimelineControl;
