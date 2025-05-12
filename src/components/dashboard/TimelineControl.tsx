
import React from "react";
import { Button } from "@/components/ui/button";

interface TimelineControlProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

// Fix: Return JSX instead of void
const TimelineControl: React.FC<TimelineControlProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <div className="flex space-x-2 py-2">
      {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((period) => (
        <Button
          key={period}
          variant={selectedPeriod === period ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period)}
          className={selectedPeriod === period ? "bg-teal-500" : ""}
        >
          {period}
        </Button>
      ))}
    </div>
  );
};

export default TimelineControl;
