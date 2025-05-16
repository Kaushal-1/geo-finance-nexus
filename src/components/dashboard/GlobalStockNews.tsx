
import React, { useState, useEffect } from "react";
import { fetchCountryStockNews, mockNewsData } from "@/services/newsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

// Sample list of major financial markets
const financialMarkets = [
  { name: "United States", code: "US", lat: 40.7128, lng: -74.006 },
  { name: "United Kingdom", code: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Japan", code: "JP", lat: 35.6762, lng: 139.6503 },
  { name: "China", code: "CN", lat: 39.9042, lng: 116.4074 },
  { name: "Germany", code: "DE", lat: 52.5200, lng: 13.4050 },
  { name: "India", code: "IN", lat: 28.6139, lng: 77.2090 },
  { name: "Australia", code: "AU", lat: -35.2809, lng: 149.1300 }
];

interface NewsItem {
  summary: string;
  citations: string[];
}

interface CountryNewsData {
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  news: NewsItem[];
}

const GlobalStockNews: React.FC = () => {
  const [newsData, setNewsData] = useState<CountryNewsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Fetch news for all markets
        const data = await fetchCountryStockNews(financialMarkets);
        
        if (data && data.length > 0) {
          setNewsData(data);
        } else {
          // If no data, create mock data based on financial markets
          const mockData = financialMarkets.map(market => ({
            countryName: market.name,
            countryCode: market.code,
            latitude: market.lat,
            longitude: market.lng,
            news: [
              {
                summary: `Latest market movements in ${market.name} affecting major tech stocks and financial indices.`,
                citations: ["https://finance.example.com/markets"]
              }
            ]
          }));
          setNewsData(mockData);
        }
      } catch (error) {
        console.error("Error fetching global stock news:", error);
        toast({
          title: "Failed to load global market news",
          description: "Using sample data instead",
          variant: "destructive",
        });
        
        // Use mock data if fetch fails
        const mockData = financialMarkets.map(market => ({
          countryName: market.name,
          countryCode: market.code,
          latitude: market.lat,
          longitude: market.lng,
          news: [
            {
              summary: `Latest market movements in ${market.name} affecting major tech stocks and financial indices.`,
              citations: ["https://finance.example.com/markets"]
            }
          ]
        }));
        setNewsData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [toast]);

  // Get country flag emoji
  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Global Stock Market News
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[350px] overflow-y-auto custom-scrollbar">
        {loading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-5/6 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {newsData.map((country, idx) => (
              <div key={`${country.countryCode}-${idx}`} className="rounded-lg p-3 bg-black/20 border border-white/5">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2" aria-label={`Flag of ${country.countryName}`}>
                    {getCountryFlag(country.countryCode)}
                  </span>
                  <h3 className="font-medium text-white">{country.countryName}</h3>
                </div>
                <div className="space-y-3">
                  {country.news.map((item, newsIdx) => (
                    <div key={`${country.countryCode}-news-${newsIdx}`} className="text-sm">
                      <p className="text-gray-300 mb-1">{item.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.citations.map((citation, citIdx) => (
                          <a 
                            key={`citation-${citIdx}`} 
                            href={citation} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300"
                          >
                            <Badge variant="outline" className="bg-blue-950/50 hover:bg-blue-900/50 border-blue-800/30 text-[10px] flex items-center gap-1">
                              Source {citIdx + 1}
                              <ExternalLink size={10} />
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalStockNews;
