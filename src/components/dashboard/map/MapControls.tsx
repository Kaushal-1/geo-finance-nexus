
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
      <div className="bg-[#0a0e17]/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Map className="h-4 w-4 text-gray-400" />
          <Switch
            checked={is3DView}
            onCheckedChange={onViewToggle}
            id="3d-toggle"
          />
          <Globe className="h-4 w-4 text-teal-400" />
          <Label htmlFor="3d-toggle" className="text-xs text-gray-300">
            {is3DView ? "3D View" : "2D View"}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default MapControls;
