import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface HomeMapboxGlobeProps {
  className?: string;
  isVisible?: boolean;
}

// Set the Mapbox token
mapboxgl.accessToken = 'pk.eyJ1Ijoia2F1c2hhbG1hcCIsImEiOiJjbWFrdTdoZXkwMWxuMmtzZGI0YjJzMm8yIn0.YMJoyUNjklC3jrOmzG7xUA';

const HomeMapboxGlobe: React.FC<HomeMapboxGlobeProps> = ({ className, isVisible = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map only once
    if (map.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.8,
        projection: 'globe',
        interactive: false, // Make it non-interactive for background
        attributionControl: false
      });

      // Handle map load event
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add atmosphere effect with vibrant colors
        map.current.setFog({
          color: 'rgb(10, 10, 20)', // Dark base
          'high-color': 'rgb(40, 50, 80)', // Slight blue tint
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

        // Add financial center markers
        addFinancialCenters(map.current);
        
        // Add connection lines between centers
        addConnectionLines(map.current);
      });

      // Set up automatic rotation for the globe
      const secondsPerRevolution = 180; // Faster rotation for visual appeal

      function spinGlobe() {
        if (!map.current) return;
        const center = map.current.getCenter();
        center.lng -= 360 / secondsPerRevolution / 60; // Smooth rotation
        map.current.easeTo({ center, duration: 10, easing: (n) => n });
        setTimeout(spinGlobe, 10);
      }

      // Start spinning - immediately for background effect
      spinGlobe();
      
      // Clean up
      return () => {
        map.current?.remove();
        map.current = null;
      };
    } catch (error) {
      console.error("Error initializing Mapbox for home:", error);
    }
  }, []);

  // Financial centers data - for visual purposes
  const financialCenters = [
    { name: "New York", coordinates: [-74.0060, 40.7128], size: 1.0 },
    { name: "London", coordinates: [-0.1278, 51.5074], size: 1.0 },
    { name: "Tokyo", coordinates: [139.6503, 35.6762], size: 1.0 },
    { name: "Hong Kong", coordinates: [114.1694, 22.3193], size: 0.9 },
    { name: "Singapore", coordinates: [103.8198, 1.3521], size: 0.9 },
    { name: "Shanghai", coordinates: [121.4737, 31.2304], size: 0.9 },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109], size: 0.8 },
    { name: "Sydney", coordinates: [151.2093, -33.8688], size: 0.8 },
    { name: "Dubai", coordinates: [55.2708, 25.2048], size: 0.8 },
    { name: "Mumbai", coordinates: [72.8777, 19.0760], size: 0.8 },
    { name: "São Paulo", coordinates: [-46.6333, -23.5505], size: 0.7 },
  ];

  // Add financial centers as markers
  const addFinancialCenters = (map: mapboxgl.Map) => {
    financialCenters.forEach(center => {
      // Create marker element with vibrant colors
      const el = document.createElement('div');
      el.className = 'home-financial-center-marker';
      
      // Use vibrant colors for better visual impact
      const colors = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#33C3F0'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.backgroundColor = randomColor;
      
      // Size based on importance
      const size = 5 + (center.size * 5);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.boxShadow = `0 0 10px ${randomColor}`;
      
      // Pulse effect
      const pulse = document.createElement('div');
      pulse.className = 'home-pulse';
      pulse.style.backgroundColor = randomColor;
      pulse.style.animation = 'home-pulse 2s infinite';
      el.appendChild(pulse);
      
      // Create and add the marker
      new mapboxgl.Marker(el)
        .setLngLat(center.coordinates)
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
    const findCenterByName = (name: string) => {
      return financialCenters.find(center => center.name === name);
    };
    
    // Create GeoJSON features for connections
    const features = connections
      .map(([from, to]) => {
        const fromCenter = findCenterByName(from);
        const toCenter = findCenterByName(to);
        
        if (!fromCenter || !toCenter) return null;
        
        return {
          type: 'Feature' as const,
          properties: {
            color: ['#0EA5E9', '#8B5CF6', '#D946EF'][Math.floor(Math.random() * 3)]
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: [fromCenter.coordinates, toCenter.coordinates]
          }
        };
      })
      .filter(Boolean);
    
    // Add source for connections
    map.addSource('home-connections', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features as any[]
      }
    });
    
    // Add line layer with vibrant colors
    map.addLayer({
      id: 'home-connection-lines',
      type: 'line',
      source: 'home-connections',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.5,
        'line-opacity': 0.8
      }
    });
  };

  return <div ref={mapContainer} className={`${className || ''} ${!isVisible ? 'opacity-0' : 'opacity-100'}`} />;
};

export default HomeMapboxGlobe;
