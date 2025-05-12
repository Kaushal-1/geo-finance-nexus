
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { marketIndices, financialCenters, timelineEvents } from "@/data/mockData";

type MapView = "globe" | "map";

interface DashboardContextType {
  mapView: MapView;
  setMapView: (view: MapView) => void;
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  timelineDate: Date;
  setTimelineDate: (date: Date) => void;
  marketData: any[];
  financialCenters: any[];
  timelineEvents: any[];
  isTimelinePlaying: boolean;
  toggleTimelinePlayback: () => void;
  newsItems: any[];
  loadingNews: boolean;
  refreshNews: (region?: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [mapView, setMapView] = useState<MapView>("globe");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [timelineDate, setTimelineDate] = useState<Date>(new Date());
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(false);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);

  const toggleTimelinePlayback = () => {
    setIsTimelinePlaying(!isTimelinePlaying);
  };

  const refreshNews = async (region: string = "global") => {
    setLoadingNews(true);
    try {
      const news = await getRelevantNews(region);
      setNewsItems(news);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      // Fallback to mock data
      setNewsItems([
        {
          id: "1",
          title: "Global Markets React to Federal Reserve Decision",
          summary: "Markets worldwide are adjusting to the recent Federal Reserve interest rate decision...",
          source: "Financial Times",
          sourceCredibility: 0.95,
          url: "#",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Asian Markets See Surge in Tech Investments",
          summary: "Technology stocks across Asian markets experienced significant growth...",
          source: "Bloomberg",
          sourceCredibility: 0.92,
          url: "#",
          timestamp: new Date().toISOString(),
        },
        {
          id: "3",
          title: "European Union Announces New Financial Regulations",
          summary: "The EU has introduced a comprehensive package of financial regulations aimed at...",
          source: "Reuters",
          sourceCredibility: 0.94,
          url: "#",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    refreshNews(selectedRegion || "global");
  }, [selectedRegion]);

  // Effect for timeline playback
  useEffect(() => {
    let interval: number;
    
    if (isTimelinePlaying) {
      interval = window.setInterval(() => {
        setTimelineDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + 1);
          return newDate;
        });
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimelinePlaying]);

  return (
    <DashboardContext.Provider
      value={{
        mapView,
        setMapView,
        selectedRegion,
        setSelectedRegion,
        timelineDate,
        setTimelineDate,
        marketData: marketIndices,
        financialCenters,
        timelineEvents,
        isTimelinePlaying,
        toggleTimelinePlayback,
        newsItems,
        loadingNews,
        refreshNews,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

// News API integration
const getRelevantNews = async (region: string, topic = "financial markets") => {
  try {
    const response = await fetch("https://api.perplexity.ai/sonar/search", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `Latest financial news affecting ${region} ${topic}`,
        max_results: 5,
      }),
    });

    const data = await response.json();

    // Transform the data as needed
    const newsItems = data.results.map((item: any) => ({
      id: item.id || Math.random().toString(36).substring(2),
      title: item.title,
      summary: item.snippet,
      source: item.source_name,
      sourceCredibility: 0.9, // Calculate based on source
      url: item.url,
      timestamp: item.published_date || new Date().toISOString(),
    }));

    return newsItems;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
