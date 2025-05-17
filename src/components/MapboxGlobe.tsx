
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { finnhubService } from '@/services/finnhubService';
import { useToast } from '@/components/ui/use-toast';
import { fetchFinancialNews, fetchCountryStockNews } from '@/services/newsService';
import { cn } from '@/lib/utils';

// Extend the Window interface to include mapboxgl
declare global {
  interface Window {
    mapboxgl: typeof mapboxgl;
  }
}

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
  countryName: string;
  coordinates: [number, number];
  performance: number;
  marketSize: number;
  symbol: string;
  news?: NewsItem[];
}

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
}

interface MarketData {
  [symbol: string]: {
    price: number;
    change: number;
    changePercent: number;
    name: string;
    symbol: string;
    error?: boolean;
  };
}

interface CountryNewsData {
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  news: {
    summary: string;
    citations: string[];
  }[];
}

const MapboxGlobe: React.FC<MapboxGlobeProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [marketData, setMarketData] = useState<MarketData>({});
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [countryNews, setCountryNews] = useState<{[country: string]: NewsItem[]}>({});
  const [countryStockNews, setCountryStockNews] = useState<CountryNewsData[]>([]);
  const { toast } = useToast();
  const spinEnabledRef = useRef<boolean>(true);
  
  // Financial centers data with country names for news fetching
  const financialCenters: FinancialCenter[] = [
    { name: "New York", countryName: "United States", coordinates: [-74.0060, 40.7128], performance: 0, marketSize: 26.3, symbol: "^GSPC" },
    { name: "London", countryName: "United Kingdom", coordinates: [-0.1278, 51.5074], performance: 0, marketSize: 20.1, symbol: "^FTSE" },
    { name: "Tokyo", countryName: "Japan", coordinates: [139.6503, 35.6762], performance: 0, marketSize: 18.5, symbol: "^N225" },
    { name: "Shanghai", countryName: "China", coordinates: [121.4737, 31.2304], performance: 0, marketSize: 15.7, symbol: "^SSE" },
    { name: "Hong Kong", countryName: "Hong Kong", coordinates: [114.1694, 22.3193], performance: 0, marketSize: 12.8, symbol: "^HSI" },
    { name: "Frankfurt", countryName: "Germany", coordinates: [8.6821, 50.1109], performance: 0, marketSize: 9.5, symbol: "^GDAXI" },
    { name: "Sydney", countryName: "Australia", coordinates: [151.2093, -33.8688], performance: 0, marketSize: 7.2, symbol: "^AXJO" },
    { name: "Mumbai", countryName: "India", coordinates: [72.8777, 19.0760], performance: 0, marketSize: 8.4, symbol: "^BSESN" },
    { name: "São Paulo", countryName: "Brazil", coordinates: [-46.6333, -23.5505], performance: 0, marketSize: 5.9, symbol: "^BVSP" }
  ];

  // Fetch news for each country and country-specific stock news
  useEffect(() => {
    // Fetch regular financial news for countries
    const fetchNewsForCountries = async () => {
      const newsMap: {[country: string]: NewsItem[]} = {};
      
      for (const center of financialCenters) {
        try {
          console.log(`Fetching news for ${center.countryName}`);
          const news = await fetchFinancialNews(center.countryName, 'financial markets');
          
          if (news && news.length > 0) {
            newsMap[center.countryName] = news.slice(0, 3); // Limit to 3 news items per country
          }
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err) {
          console.error(`Error fetching news for ${center.countryName}:`, err);
        }
      }
      
      setCountryNews(newsMap);
    };

    // Fetch country-specific stock news using Perplexity
    const fetchStockNewsForCountries = async () => {
      try {
        // Fetch for all major countries at once to minimize API calls
        const majorCountries = [
          {name: "United States", code: "US", lat: 37.0902, lng: -95.7129},
          {name: "United Kingdom", code: "UK", lat: 55.3781, lng: -3.4360},
          {name: "Japan", code: "JP", lat: 36.2048, lng: 138.2529},
          {name: "China", code: "CN", lat: 35.8617, lng: 104.1954},
          {name: "Germany", code: "DE", lat: 51.1657, lng: 10.4515},
          {name: "India", code: "IN", lat: 20.5937, lng: 78.9629},
          {name: "Australia", code: "AU", lat: -25.2744, lng: 133.7751},
          {name: "Brazil", code: "BR", lat: -14.2350, lng: -51.9253}
        ];
        
        const newsData = await fetchCountryStockNews(majorCountries);
        if (newsData && newsData.length > 0) {
          setCountryStockNews(newsData);
          console.log("Received country stock news data:", newsData);
        }
      } catch (err) {
        console.error("Error fetching country stock news:", err);
        toast({
          title: "Error fetching country news",
          description: "Could not load country-specific stock news. Some features may be limited.",
          variant: "destructive",
        });
      }
    };
    
    fetchNewsForCountries();
    fetchStockNewsForCountries();
    
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNewsForCountries, 1800000);
    const stockNewsInterval = setInterval(fetchStockNewsForCountries, 3600000); // Refresh stock news hourly
    
    return () => {
      clearInterval(interval);
      clearInterval(stockNewsInterval);
    };
  }, []);

  // Fetch market data with reduced frequency
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Create list of symbols to fetch
        const symbols = financialCenters.map(center => center.symbol);
        
        // Queue symbol requests with delay between each to prevent rate limiting
        const dataMap: MarketData = {};
        
        for (const symbol of symbols) {
          try {
            console.log(`Fetching globe data for ${symbol}`);
            const result = await finnhubService.getQuote(symbol);
            
            dataMap[symbol] = {
              price: result.price || 0,
              change: result.change || 0,
              changePercent: result.changePercent || 0,
              name: result.name || symbol.replace('^', ''),
              symbol: result.symbol,
              error: false
            };
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err);
            dataMap[symbol] = {
              price: 0,
              change: 0,
              changePercent: 0,
              name: symbol.replace('^', ''),
              symbol: symbol,
              error: true
            };
          }
        }
        
        setMarketData(dataMap);
        
        // Update financial center performances based on data
        financialCenters.forEach(center => {
          const data = dataMap[center.symbol];
          if (data && !data.error) {
            center.performance = data.changePercent;
          }
        });
        
        // If map is loaded, update the markers
        if (mapLoaded && map.current) {
          updateMarkers(map.current, dataMap);
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
        toast({
          title: "Data Fetch Error",
          description: "Could not fetch real-time market data for the globe.",
          variant: "destructive",
        });
      }
    };
    
    // Fetch initial data
    fetchMarketData();
    
    // Set up interval to refresh data less frequently (2 minutes)
    const intervalId = setInterval(fetchMarketData, 120000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [mapLoaded]);

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
        projection: 'globe',
        attributionControl: false // Hide default attribution control
      });

      // Add navigation control to bottom-right
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false,
        visualizePitch: false
      }), 'bottom-right');
      
      // Add attribution in a more elegant way
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: 'Powered by MapBox | GeoFinance 2025'
      }), 'bottom-left');

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

        // Update markers with real data if available
        if (Object.keys(marketData).length > 0) {
          updateMarkers(map.current, marketData);
        } else {
          // Otherwise use static data
          addFinancialCenters(map.current);
        }
        
        addConnectionLines(map.current);
        
        // Add country stock news markers
        if (countryStockNews.length > 0) {
          addCountryNewsMarkers(map.current, countryStockNews);
        }
        
        setMapLoaded(true);
      });

      // Set up automatic rotation for the globe
      let userInteracting = false;
      spinEnabledRef.current = true;
      const secondsPerRevolution = 240;

      function spinGlobe() {
        if (!map.current || !spinEnabledRef.current || userInteracting) return;
        
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
      toast({
        title: "Map Error",
        description: "Could not initialize the interactive map.",
        variant: "destructive",
      });
    }
  }, []);

  // Effect to add country news markers when data is available
  useEffect(() => {
    if (map.current && mapLoaded && countryStockNews.length > 0) {
      addCountryNewsMarkers(map.current, countryStockNews);
    }
  }, [countryStockNews, mapLoaded]);

  // Add country news markers to the map
  const addCountryNewsMarkers = (map: mapboxgl.Map, newsData: CountryNewsData[]) => {
    console.log("Adding country news markers:", newsData);
    
    newsData.forEach(country => {
      if (!country.news || country.news.length === 0) return;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'country-news-marker';
      el.style.backgroundColor = '#F97316';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 10px 2px rgba(249, 115, 22, 0.6)';

      // Add click event to pause rotation
      el.addEventListener('click', () => {
        // Pause the globe rotation when clicking on a news marker
        spinEnabledRef.current = false;
        
        // Show a toast notification that rotation is paused
        toast({
          title: "Globe rotation paused",
          description: "Click on the map background to resume rotation",
          duration: 3000,
        });
      });
      
      // Create popup content with clickable citations
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
        className: 'country-news-popup'
      });
      
      const popupContent = document.createElement('div');
      popupContent.className = 'popup-content';
      popupContent.innerHTML = `
        <h3 class="popup-title">${country.countryName} Stock News</h3>
        <div class="news-items space-y-2">
          ${country.news.map(item => `
            <div class="news-item">
              <p class="text-sm">${item.summary}</p>
              <div class="citation-links">
                ${item.citations.map((url, idx) => `
                  <a href="${url}" target="_blank" rel="noopener noreferrer" 
                     class="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors">
                    Source ${idx + 1}
                  </a>
                `).join(' | ')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      popup.setDOMContent(popupContent);
      
      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([country.longitude, country.latitude])
        .setPopup(popup)
        .addTo(map);

      // When popup is closed, resume rotation
      popup.on('close', () => {
        spinEnabledRef.current = true;
      });
        
      // Store reference to marker
      markersRef.current[`country-${country.countryCode}`] = marker;
    });

    // Add a click handler to the map to resume rotation
    map.on('click', (e) => {
      // Only handle clicks on the map background, not on markers
      if (e.originalEvent.target === mapContainer.current || 
          e.originalEvent.target === map.getCanvas()) {
        spinEnabledRef.current = true;
      }
    });
  };

  // Update markers with real-time data
  const updateMarkers = (map: mapboxgl.Map, data: MarketData) => {
    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => {
      // Only remove financial center markers (not country news markers)
      if (!marker.getElement().className.includes('country-news-marker')) {
        marker.remove();
      }
    });
    
    // Filter markers object to keep only country news markers
    const filteredMarkers: { [key: string]: mapboxgl.Marker } = {};
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      if (marker.getElement().className.includes('country-news-marker')) {
        filteredMarkers[key] = marker;
      }
    });
    markersRef.current = filteredMarkers;
    
    // Add markers with real-time data
    financialCenters.forEach(center => {
      // Get market data for this center
      const marketInfo = data[center.symbol];
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'financial-center-marker';
      
      // Style based on performance
      let color;
      if (!marketInfo || marketInfo.error) {
        color = '#90a4ae'; // Neutral color for error or no data
        center.performance = 0;
      } else {
        color = marketInfo.change >= 0 ? '#00e676' : '#ff5252';
        center.performance = marketInfo.changePercent;
      }
      el.style.backgroundColor = color;
      
      // Size based on market size
      const size = 10 + (center.marketSize / 3);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      
      // Pulse effect
      el.innerHTML = `<div class="pulse" style="background-color: ${color};"></div>`;
      
      // Get country news
      const news = countryNews[center.countryName] || [];
      center.news = news;
      
      // Add popup with live data and news
      let popupContent;
      
      // Start with the main financial center information
      let mainContent = `
        <div class="popup-content">
          <h3 class="popup-title">${center.name}, ${center.countryName}</h3>
      `;
      
      if (!marketInfo || marketInfo.error) {
        mainContent += `
          <div class="popup-data">
            <span class="popup-label">Status:</span>
            <span class="popup-value">Data unavailable</span>
          </div>
          <div class="popup-data">
            <span class="popup-label">Market Size:</span>
            <span class="popup-value">$${center.marketSize.toFixed(1)}T</span>
          </div>
        `;
      } else {
        mainContent += `
          <div class="popup-data">
            <span class="popup-label">Price:</span>
            <span class="popup-value">${marketInfo.price.toFixed(2)}</span>
          </div>
          <div class="popup-data">
            <span class="popup-label">Performance:</span>
            <span class="popup-value ${marketInfo.change >= 0 ? 'positive' : 'negative'}">
              ${marketInfo.change >= 0 ? '+' : ''}${marketInfo.changePercent.toFixed(2)}%
            </span>
          </div>
          <div class="popup-data">
            <span class="popup-label">Market Size:</span>
            <span class="popup-value">$${center.marketSize.toFixed(1)}T</span>
          </div>
        `;
      }
      
      // Add news section if available
      let newsContent = '';
      if (news && news.length > 0) {
        newsContent = `
          <div class="mt-3 pt-3 border-t border-white/10">
            <h4 class="text-sm font-semibold text-white mb-2">Latest News</h4>
            <div class="news-items space-y-2">
        `;
        
        news.forEach((item) => {
          newsContent += `
            <div class="news-item">
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors">
                ${item.title}
              </a>
              <p class="text-[10px] text-white/60">${item.source}</p>
            </div>
          `;
        });
        
        newsContent += `
            </div>
          </div>
        `;
      }
      
      // Combine the main content and news content
      popupContent = mainContent + newsContent + '</div>';
      
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
        className: 'financial-center-popup'
      }).setHTML(popupContent);
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(center.coordinates)
        .setPopup(popup)
        .addTo(map);
        
      // Store reference to marker
      markersRef.current[center.symbol] = marker;
    });
  };

  // Add financial centers as markers (fallback to static data)
  const addFinancialCenters = (map: mapboxgl.Map) => {
    financialCenters.forEach(center => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'financial-center-marker';
      el.style.backgroundColor = '#90a4ae'; // Grey color for static data
      
      // Size based on market size
      const size = 10 + (center.marketSize / 3);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      
      // Pulse effect
      el.innerHTML = `<div class="pulse" style="background-color: #90a4ae;"></div>`;
      
      // Get country news
      const news = countryNews[center.countryName] || [];
      
      // Add popup with static data and news if available
      let popupContent = `
        <div class="popup-content">
          <h3 class="popup-title">${center.name}, ${center.countryName}</h3>
          <div class="popup-data">
            <span class="popup-label">Status:</span>
            <span class="popup-value">Data unavailable</span>
          </div>
          <div class="popup-data">
            <span class="popup-label">Market Size:</span>
            <span class="popup-value">$${center.marketSize.toFixed(1)}T</span>
          </div>
      `;
      
      // Add news section if available
      if (news && news.length > 0) {
        popupContent += `
          <div class="mt-3 pt-3 border-t border-white/10">
            <h4 class="text-sm font-semibold text-white mb-2">Latest News</h4>
            <div class="news-items space-y-2">
        `;
        
        news.forEach((item) => {
          popupContent += `
            <div class="news-item">
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors">
                ${item.title}
              </a>
              <p class="text-[10px] text-white/60">${item.source}</p>
            </div>
          `;
        });
        
        popupContent += `
            </div>
          </div>
        `;
      }
      
      popupContent += `</div>`;
      
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
        className: 'financial-center-popup'
      }).setHTML(popupContent);
      
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
      ['Shanghai', 'Tokyo'],
      ['Frankfurt', 'Mumbai'],
      ['Sydney', 'Tokyo'],
      ['São Paulo', 'New York'],
      ['Mumbai', 'Hong Kong']
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
        }).filter(Boolean) as any[]
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
  };

  return <div ref={mapContainer} className={cn('h-full w-full', className)} />;
};

export default MapboxGlobe;
