
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token - using the existing token from the code
mapboxgl.accessToken = 'pk.eyJ1Ijoia2F1c2hhbG1hcCIsImEiOiJjbWFrdTdoZXkwMWxuMmtzZGI0YjJzMm8yIn0.YMJoyUNjklC3jrOmzG7xUA';

// Make mapboxgl available on the window for troubleshooting
if (typeof window !== 'undefined') {
  window.mapboxgl = mapboxgl;
}

interface MapboxGlobeProps {
  className?: string;
}

interface FinancialCenter {
  name: string;
  coordinates: [number, number];
  performance: number;
  marketSize: number;
}

const MapboxGlobe: React.FC<MapboxGlobeProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Financial centers data
  const financialCenters: FinancialCenter[] = [
    { name: "New York", coordinates: [-74.0060, 40.7128], performance: 1.2, marketSize: 26.3 },
    { name: "London", coordinates: [-0.1278, 51.5074], performance: -0.5, marketSize: 20.1 },
    { name: "Tokyo", coordinates: [139.6503, 35.6762], performance: 0.7, marketSize: 18.5 },
    { name: "Shanghai", coordinates: [121.4737, 31.2304], performance: -1.1, marketSize: 15.7 },
    { name: "Hong Kong", coordinates: [114.1694, 22.3193], performance: 0.8, marketSize: 12.8 },
    { name: "Singapore", coordinates: [103.8198, 1.3521], performance: 0.4, marketSize: 10.2 },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109], performance: -0.3, marketSize: 9.5 },
    { name: "Sydney", coordinates: [151.2093, -33.8688], performance: 0.6, marketSize: 8.7 },
    { name: "Dubai", coordinates: [55.2708, 25.2048], performance: 1.1, marketSize: 7.3 },
    { name: "Mumbai", coordinates: [72.8777, 19.0760], performance: -0.8, marketSize: 6.8 },
    { name: "São Paulo", coordinates: [-46.6333, -23.5505], performance: 0.3, marketSize: 5.9 }
  ];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map only once
    if (map.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.5,
        projection: 'globe'
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      // Handle map load event
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add atmosphere effect
        map.current.setFog({
          color: 'rgb(10, 14, 23)',
          'high-color': 'rgb(19, 27, 46)',
          'horizon-blend': 0.2
        });
        
        // Add 3D terrain
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        });
        
        map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        
        // Add sky layer
        map.current.addLayer({
          'id': 'sky',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-color': 'rgba(19, 27, 46, 1)'
          }
        });

        addFinancialCenters(map.current);
        addConnectionLines(map.current);
        setMapLoaded(true);
      });

      // Set up automatic rotation for the globe
      let userInteracting = false;
      let spinEnabled = true;
      const secondsPerRevolution = 240;

      function spinGlobe() {
        if (!map.current || !spinEnabled || userInteracting) return;
        
        const center = map.current.getCenter();
        center.lng -= 360 / secondsPerRevolution;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }

      // User interaction handlers
      map.current.on('mousedown', () => {
        userInteracting = true;
      });
      
      map.current.on('mouseup', () => {
        userInteracting = false;
        setTimeout(spinGlobe, 1000);
      });

      map.current.on('touchstart', () => {
        userInteracting = true;
      });
      
      map.current.on('touchend', () => {
        userInteracting = false;
        setTimeout(spinGlobe, 1000);
      });

      // Start spinning
      const spinInterval = setInterval(spinGlobe, 1000);
      
      // Clean up
      return () => {
        clearInterval(spinInterval);
        map.current?.remove();
        map.current = null;
      };
    } catch (error) {
      console.error("Error initializing Mapbox:", error);
    }
  }, []);

  // Add financial centers as markers
  const addFinancialCenters = (map: mapboxgl.Map) => {
    financialCenters.forEach(center => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'financial-center-marker';
      
      // Style based on performance
      const color = center.performance >= 0 ? '#00e676' : '#ff5252';
      el.style.backgroundColor = color;
      
      // Size based on market size
      const size = 10 + (center.marketSize / 3);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      
      // Pulse effect
      el.innerHTML = `<div class="pulse" style="background-color: ${color};"></div>`;
      
      // Add popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'financial-center-popup'
      }).setHTML(`
        <div class="popup-content">
          <h3 class="popup-title">${center.name}</h3>
          <div class="popup-data">
            <span class="popup-label">Performance:</span>
            <span class="popup-value ${center.performance >= 0 ? 'positive' : 'negative'}">
              ${center.performance >= 0 ? '+' : ''}${center.performance}%
            </span>
          </div>
          <div class="popup-data">
            <span class="popup-label">Market Size:</span>
            <span class="popup-value">$${center.marketSize.toFixed(1)}T</span>
          </div>
        </div>
      `);
      
      // Create and add the marker
      new mapboxgl.Marker(el)
        .setLngLat(center.coordinates)
        .setPopup(popup)
        .addTo(map);
    });
  };

  // Add connection lines between financial centers
  const addConnectionLines = (map: mapboxgl.Map) => {
    // Define connections between major financial centers
    const connections = [
      ['New York', 'London'],
      ['London', 'Frankfurt'],
      ['New York', 'Hong Kong'],
      ['Tokyo', 'Hong Kong'],
      ['Singapore', 'Hong Kong'],
      ['London', 'Dubai'],
      ['Shanghai', 'Tokyo'],
      ['Mumbai', 'Dubai'],
      ['Singapore', 'Sydney'],
      ['New York', 'São Paulo']
    ];
    
    // Find center by name
    const findCenterByName = (name: string): FinancialCenter | undefined => {
      return financialCenters.find(center => center.name === name);
    };
    
    // Create a source for the connections
    map.addSource('connections', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: connections.map(([from, to]) => {
          const fromCenter = findCenterByName(from);
          const toCenter = findCenterByName(to);
          
          if (!fromCenter || !toCenter) return null;
          
          // Create a GeoJSON LineString feature
          return {
            type: 'Feature',
            properties: {
              from,
              to,
              // Style based on performance of both centers
              color: (fromCenter.performance + toCenter.performance >= 0) ? '#00b8d4' : '#7b61ff'
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                fromCenter.coordinates,
                toCenter.coordinates
              ]
            }
          };
        }).filter(Boolean) as GeoJSON.Feature[]
      }
    });
    
    // Add line layer
    map.addLayer({
      id: 'connection-lines',
      type: 'line',
      source: 'connections',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.5,
        'line-opacity': 0.7
      }
    });
    
    // Add animated arrows along the lines
    map.addLayer({
      id: 'connection-arrows',
      type: 'symbol',
      source: 'connections',
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 150,
        'icon-image': 'arrow',
        'icon-size': 0.5,
        'icon-rotate': 90,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });
  };

  return <div ref={mapContainer} className={`h-full w-full ${className || ''}`} />;
};

export default MapboxGlobe;
