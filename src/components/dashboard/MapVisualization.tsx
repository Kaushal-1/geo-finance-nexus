
import React from "react";
import MapView from "./map/MapView";
import MapLegend from "./map/MapLegend";
import MapInfoCard from "./map/MapInfoCard";

const MapVisualization: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Map Container - Always 3D */}
      <MapView is3DView={true} />

      {/* Legend */}
      <MapLegend />

      {/* Floating Info Card */}
      <MapInfoCard />
    </div>
  );
};

export default MapVisualization;
