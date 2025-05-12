
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Skeleton } from '@/components/ui/skeleton';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoibHZ2b2xtZXIiLCJhIjoiY2xtM3V1OHN1MDAzNjJqcW5rZHJxZmdnaiJ9.jA-RvtGKqJJMl-Q9Sug3uA';

interface SupplyChainLocation {
  type: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface CompanyMapPanelProps {
  locations: SupplyChainLocation[];
  companyName: string;
}

const CompanyMapPanel: React.FC<CompanyMapPanelProps> = ({ locations, companyName }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locations || locations.length === 0) {
      setError('No location data available for this company.');
      return;
    }

    if (mapContainer.current === null) return;

    // Check if WebGL is supported
    if (!mapboxgl.supported()) {
      setError('Your browser does not support WebGL, which is required for displaying maps.');
      return;
    }

    // Initialize map
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: locations[0].coordinates, // Center on headquarters
        zoom: 1.2
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // When map loads, add markers
      map.current.on('load', () => {
        // Add markers for each location
        locations.forEach(location => {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = `financial-center-marker ${location.type}`;
          
          // Size based on location type
          let size = 15;
          let color = '#90a4ae';
          
          if (location.type === 'headquarters') {
            size = 25;
            color = '#00e676';
          } else if (location.type === 'r&d') {
            size = 20;
            color = '#7b61ff';
          } else if (location.type === 'manufacturing') {
            color = '#4fc3f7';
          } else if (location.type === 'datacenter') {
            color = '#00e676';
          } else if (location.type === 'fulfillment') {
            color = '#ff9800';
          }
          
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.backgroundColor = color;
          
          // Add pulse effect
          const pulse = document.createElement('div');
          pulse.className = 'pulse';
          pulse.style.backgroundColor = color;
          el.appendChild(pulse);
          
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'popup-content';
          
          const title = document.createElement('div');
          title.className = 'popup-title';
          title.textContent = location.name;
          
          const locationType = document.createElement('div');
          locationType.className = 'popup-data';
          locationType.innerHTML = `<span class="popup-label">Type:</span> <span class="popup-value">${capitalizeFirstLetter(location.type)}</span>`;
          
          const locationAddress = document.createElement('div');
          locationAddress.className = 'popup-data';
          locationAddress.innerHTML = `<span class="popup-label">Location:</span> <span class="popup-value">${location.location}</span>`;
          
          popupContent.appendChild(title);
          popupContent.appendChild(locationType);
          popupContent.appendChild(locationAddress);
          
          // Create popup
          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: false,
            className: 'financial-center-popup'
          }).setDOMContent(popupContent);
          
          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .setPopup(popup)
            .addTo(map.current!);
        });
        
        // Add connection lines between locations
        if (locations.length > 1) {
          const headquarters = locations.find(loc => loc.type === 'headquarters');
          
          if (headquarters) {
            // Create GeoJSON for connections from HQ to other locations
            const connectionsGeoJSON = {
              type: 'FeatureCollection',
              features: locations
                .filter(loc => loc.type !== 'headquarters')
                .map(loc => ({
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [headquarters.coordinates, loc.coordinates]
                  },
                  properties: {
                    type: loc.type
                  }
                }))
            };
            
            // Add connection source
            map.current.addSource('connections', {
              type: 'geojson',
              data: connectionsGeoJSON as any
            });
            
            // Add connection layer
            map.current.addLayer({
              id: 'connections-layer',
              type: 'line',
              source: 'connections',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': [
                  'match',
                  ['get', 'type'],
                  'manufacturing', '#4fc3f7',
                  'r&d', '#7b61ff',
                  'datacenter', '#00e676',
                  'fulfillment', '#ff9800',
                  '#90a4ae' // default color
                ],
                'line-width': 1.5,
                'line-opacity': 0.7,
                'line-dasharray': [0, 2, 1]
              }
            });
          }
        }
        
        // Fit bounds to show all locations
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
          bounds.extend(location.coordinates);
        });
        
        map.current!.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 5
        });

        setIsLoaded(true);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize the map. Please try again later.');
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [locations, companyName]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Footprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Footprint</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg overflow-hidden h-[400px]">
          <div ref={mapContainer} className="w-full h-full" />

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <Skeleton className="h-full w-full" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-muted/80 backdrop-blur-sm p-2 rounded-md">
            <div className="text-xs font-medium mb-1">Legend:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00e676]"></div>
                <span className="text-xs">Headquarters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7b61ff]"></div>
                <span className="text-xs">R&D Center</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4fc3f7]"></div>
                <span className="text-xs">Manufacturing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00e676] opacity-70"></div>
                <span className="text-xs">Data Center</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff9800]"></div>
                <span className="text-xs">Fulfillment</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default CompanyMapPanel;
