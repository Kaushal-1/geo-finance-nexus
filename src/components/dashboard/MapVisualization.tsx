
import React from "react";
import MapView from "./map/MapView";
import MapControls from "./map/MapControls";
import MapLegend from "./map/MapLegend";
import MapInfoCard from "./map/MapInfoCard";

interface MapVisualizationProps {
  is3DView: boolean;
  onViewToggle: () => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ 
  is3DView, 
  onViewToggle 
}) => {
  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <MapView is3DView={is3DView} />

      {/* Map Controls */}
      <MapControls is3DView={is3DView} onViewToggle={onViewToggle} />

      {/* Legend */}
      <MapLegend />

      {/* Floating Info Card */}
      <MapInfoCard />
    </div>
  );
};

export default MapVisualization;
