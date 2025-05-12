import React from "react";
import { Switch } from "@/components/ui/switch";
interface MapControlsProps {
  is3DView: boolean;
  onViewToggle: () => void;
}
const MapControls: React.FC<MapControlsProps> = ({
  is3DView,
  onViewToggle
}) => {
  return <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      

      
    </div>;
};
export default MapControls;