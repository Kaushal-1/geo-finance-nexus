
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Globe, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";
import { toast } from "@/components/ui/use-toast";

// Set Mapbox token
mapboxgl.accessToken = "pk.eyJ1Ijoia2F1c2hhbG1hcCIsImEiOiJjbWFrdTdoZXkwMWxuMmtzZGI0YjJzMm8yIn0.YMJoyUNjklC3jrOmzG7xUA";

const MapVisualization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { 
    mapView, 
    setMapView, 
    selectedRegion, 
    setSelectedRegion, 
    financialCenters,
    timelineDate 
  } = useDashboard();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
      projection: mapView === "globe" ? "globe" : "mercator",
      attributionControl: false
    });

    map.current.addControl(
      new mapboxgl.AttributionControl({
        compact: true
      }),
      "bottom-right"
    );

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showCompass: true
      }),
      "bottom-right"
    );

    // Add atmosphere and terrain effects
    map.current.on("load", () => {
      // Add fog effect for depth
      map.current?.setFog({
        color: "rgb(10, 14, 23)",
        "high-color": "rgb(19, 27, 46)",
        "horizon-blend": 0.2
      });
      
      // Add 3D terrain
      map.current?.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1"
      });
      map.current?.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      
      // Add sky layer for globe view
      map.current?.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-color": "rgba(19, 27, 46, 1)"
        }
      });
      
      // Start the globe spinning (if in globe view)
      if (mapView === "globe") {
        startGlobeSpin();
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update projection when map view changes
  useEffect(() => {
    if (map.current) {
      map.current.setProjection(mapView === "globe" ? "globe" : "mercator");
      
      if (mapView === "globe") {
        startGlobeSpin();
      } else {
        // Stop spinning if we switch to flat map
        stopGlobeSpin();
      }
    }
  }, [mapView]);
  
  // Handle financial centers as markers on the map
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    // Wait for the map style to load completely
    if (!map.current.isStyleLoaded()) {
      map.current.once("idle", addMarkers);
    } else {
      addMarkers();
    }

    function addMarkers() {
      if (!map.current) return;
      
      // Remove existing markers
      Object.values(markers.current).forEach(marker => marker.remove());
      markers.current = {};
      
      // Add markers for financial centers
      financialCenters.forEach(center => {
        // Create marker element
        const el = document.createElement("div");
        el.className = "financial-center-marker";
        
        // Set marker style based on performance
        const markerSize = 14 + (center.significance * 10);
        const positive = center.performance >= 0;
        
        el.style.width = `${markerSize}px`;
        el.style.height = `${markerSize}px`;
        el.style.borderRadius = "50%";
        el.style.background = positive ? "rgba(16, 185, 129, 0.7)" : "rgba(239, 68, 68, 0.7)";
        el.style.border = `2px solid ${positive ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}`;
        el.style.boxShadow = `0 0 ${markerSize/2}px ${positive ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)"}`;
        
        // Create and add the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(center.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(`
                <div class="p-2 text-sm">
                  <div class="font-bold">${center.name}</div>
                  <div class="text-xs mono ${positive ? 'text-green-500' : 'text-red-500'}">${center.performance > 0 ? '+' : ''}${center.performance.toFixed(2)}%</div>
                  <div class="text-xs text-gray-400">${center.marketStatus}</div>
                </div>
              `)
          )
          .addTo(map.current!);
        
        // Store reference
        markers.current[center.id] = marker;
        
        // Add click event
        el.addEventListener("click", () => {
          setSelectedRegion(center.region);
          toast({
            title: `Selected region: ${center.region}`,
            description: `Viewing financial data for ${center.name}`,
          });
        });
      });
    }
    
    return () => {
      // Clean up markers on unmount
      Object.values(markers.current).forEach(marker => marker.remove());
    };
  }, [financialCenters, map.current, timelineDate]);

  // Functions for globe spinning animation
  const spinInterval = useRef<number | null>(null);
  
  const startGlobeSpin = () => {
    if (!map.current || spinInterval.current) return;
    
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    
    spinInterval.current = window.setInterval(() => {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      if (zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond / 4; // Slower rotation for better UX
        map.current.easeTo({ center, duration: 100, easing: (n) => n });
      }
    }, 100);
  };
  
  const stopGlobeSpin = () => {
    if (spinInterval.current) {
      clearInterval(spinInterval.current);
      spinInterval.current = null;
    }
  };
  
  // Event handlers for user interaction
  useEffect(() => {
    if (!map.current) return;
    
    const handleMouseDown = () => stopGlobeSpin();
    const handleMouseUp = () => {
      if (mapView === "globe") startGlobeSpin();
    };
    
    map.current.on("mousedown", handleMouseDown);
    map.current.on("touchstart", handleMouseDown);
    map.current.on("mouseup", handleMouseUp);
    map.current.on("touchend", handleMouseUp);
    
    return () => {
      if (!map.current) return;
      map.current.off("mousedown", handleMouseDown);
      map.current.off("touchstart", handleMouseDown);
      map.current.off("mouseup", handleMouseUp);
      map.current.off("touchend", handleMouseUp);
    };
  }, [mapView]);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* View toggle controls */}
      <div className="absolute top-4 right-4 z-10 bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-white/10">
        <div className="flex">
          <Button
            variant={mapView === "globe" ? "default" : "ghost"}
            size="sm"
            className={mapView === "globe" ? "bg-teal text-white" : "text-white/70"}
            onClick={() => setMapView("globe")}
          >
            <Globe className="h-4 w-4 mr-1" />
            Globe
          </Button>
          <Button
            variant={mapView === "map" ? "default" : "ghost"}
            size="sm"
            className={mapView === "map" ? "bg-teal text-white" : "text-white/70"}
            onClick={() => setMapView("map")}
          >
            <MapIcon className="h-4 w-4 mr-1" />
            Map
          </Button>
        </div>
      </div>
      
      {/* Region indicator */}
      {selectedRegion && (
        <div className="absolute top-4 left-4 z-10 bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-white/10 animate-fade-in">
          <div className="text-white text-sm">
            <span className="text-white/60">Region:</span> {selectedRegion}
          </div>
        </div>
      )}

      {/* Custom CSS for markers */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          background: rgba(10, 14, 23, 0.95);
          color: white;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          padding: 8px;
          font-family: 'Inter', sans-serif;
        }
        
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: rgba(10, 14, 23, 0.95);
        }
        
        .financial-center-marker {
          cursor: pointer;
          animation: pulse 2s infinite;
          transition: all 0.3s ease;
        }
        
        .financial-center-marker:hover {
          transform: scale(1.3);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
        
        .mono {
          font-family: 'Roboto Mono', monospace;
        }
      `}</style>
    </div>
  );
};

export default MapVisualization;
