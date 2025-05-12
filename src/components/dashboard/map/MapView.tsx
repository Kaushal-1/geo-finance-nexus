
import React from "react";
import Globe from "@/components/Globe";
import MapboxGlobe from "@/components/MapboxGlobe";
import { Skeleton } from "@/components/ui/skeleton";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/components/mapbox.css";

interface MapViewProps {
  is3DView: boolean;
}

const MapView: React.FC<MapViewProps> = ({ is3DView }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {is3DView ? (
        <MapboxGlobe className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1a2035]">
          <Skeleton className="w-4/5 h-4/5 rounded-xl bg-white/5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50 text-lg">2D Map View (Coming Soon)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
