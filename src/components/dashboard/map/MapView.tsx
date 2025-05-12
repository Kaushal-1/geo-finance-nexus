
import React, { useEffect, useState } from "react";
import MapboxGlobe from "@/components/MapboxGlobe";
import { Skeleton } from "@/components/ui/skeleton";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/components/mapbox.css";
import { useToast } from "@/components/ui/use-toast";
import mapboxgl from "mapbox-gl";

interface MapViewProps {
  is3DView: boolean;
}

const MapView: React.FC<MapViewProps> = ({ is3DView }) => {
  const { toast } = useToast();
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const isSupported = mapboxgl.supported();
      setIsWebGLSupported(isSupported);
      
      if (!isSupported) {
        toast({
          title: "WebGL not supported",
          description: "Your browser does not support WebGL, which is required for the 3D globe. Falling back to 2D view.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking Mapbox support:", error);
      setIsWebGLSupported(false);
      
      toast({
        title: "Error initializing map",
        description: "There was a problem loading the map. Please try again later.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {is3DView && isWebGLSupported ? (
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
