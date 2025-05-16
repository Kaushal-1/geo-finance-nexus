
import React, { useEffect } from "react";
import MapView from "./map/MapView";
import MapLegend from "./map/MapLegend";
import MapInfoCard from "./map/MapInfoCard";

const MapVisualization: React.FC = () => {
  // Add a preloading effect for map data
  useEffect(() => {
    // Prefetch map data to improve loading speed
    const prefetchMapData = async () => {
      try {
        // Trigger data loading ahead of time
        const cachedResponse = await fetch('/api/map-data', {
          cache: 'force-cache'
        });
        
        // If we have APIs to pre-warm, add them here
        // This helps initialize connections early
      } catch (error) {
        // Silently handle prefetch errors
        console.log('Prefetch initiated');
      }
    };
    
    prefetchMapData();
  }, []);

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
