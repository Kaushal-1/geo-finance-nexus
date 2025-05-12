
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Map } from "lucide-react";

interface MapControlsProps {
  is3DView: boolean;
  onViewToggle: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  is3DView,
  onViewToggle
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm p-2 rounded-md border border-white/10">
        <Globe className={`h-4 w-4 ${is3DView ? 'text-teal-400' : 'text-gray-400'}`} />
        <Switch 
          checked={is3DView}
          onCheckedChange={onViewToggle}
          className="data-[state=checked]:bg-teal-600"
        />
        <Map className={`h-4 w-4 ${!is3DView ? 'text-teal-400' : 'text-gray-400'}`} />
      </div>
    </div>
  );
};

export default MapControls;
