
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSonarAnalysis } from "@/hooks/useSonarAnalysis";

interface StockNewsPanelProps {
  symbol: string;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  publishedAt: string;
  impact: 'High' | 'Medium' | 'Low';
  impactColor?: string;
}

const StockNewsPanel: React.FC<StockNewsPanelProps> = ({ symbol }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { runNewsAnalysis } = useSonarAnalysis();
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get color based on sentiment
  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'Bullish': return 'text-green-500';
      case 'Bearish': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  // Get impact color
  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'High': return '#ff5252';
      case 'Medium': return '#7b61ff';
      default: return '#00b8d4';
    }
  };
  
  // Fetch news for the stock
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const newsData = await runNewsAnalysis(symbol, {
          timeframe: "1week",
          limit: 5,
        });
        
        if (newsData && newsData.newsItems && newsData.newsItems.length > 0) {
          // Process and add color coding for impact levels
          const processedNews = newsData.newsItems.map((item: any) => ({
            ...item,
            impactColor: getImpactColor(item.impact),
            publishedAt: item.publishedAt || new Date().toISOString()
          }));
          
          setNews(processedNews.slice(0, 3)); // Show top 3 news items
        } else {
          // Use mock data if API fails
          setNews(getMockNews(symbol));
        }
      } catch (error) {
        console.error(`Failed to fetch news for ${symbol}:`, error);
        setNews(getMockNews(symbol));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [symbol, runNewsAnalysis]);
  
  // Mock news data as fallback
  const getMockNews = (stockSymbol: string): NewsItem[] => {
    const baseNewsItems: NewsItem[] = [
      {
        title: `${stockSymbol} Reports Strong Quarterly Earnings`,
        summary: `${stockSymbol} exceeded analyst expectations with revenue growth of 15% year-over-year. The company also announced a share buyback program.`,
        source: "Financial Times",
        url: "#",
        sentiment: 'Bullish',
        publishedAt: new Date().toISOString(),
        impact: 'High',
      },
      {
        title: `New Product Line Announcement from ${stockSymbol}`,
        summary: `${stockSymbol} unveiled its next generation of products at their annual conference, expected to drive significant sales in upcoming quarters.`,
        source: "Bloomberg",
        url: "#",
        sentiment: 'Bullish',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        impact: 'Medium',
      },
      {
        title: `Regulatory Scrutiny Increases for ${stockSymbol}`,
        summary: `Government regulators announced they are reviewing some business practices of ${stockSymbol}, which could impact future operations.`,
        source: "Wall Street Journal",
        url: "#",
        sentiment: 'Bearish',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        impact: 'Medium',
      }
    ];
    
    return baseNewsItems.map(item => ({
      ...item,
      impactColor: getImpactColor(item.impact)
    }));
  };
  
  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{symbol} Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full bg-gray-800" />
            <Skeleton className="h-24 w-full bg-gray-800" />
            <Skeleton className="h-24 w-full bg-gray-800" />
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="border-b border-gray-800 pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.impactColor }}
                  ></div>
                  <h4 className="font-medium flex-1">{item.title}</h4>
                </div>
                <p className="text-sm text-gray-400 mt-1 mb-2">{item.summary}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{item.source} · {formatDate(item.publishedAt)}</span>
                  <span className={getSentimentColor(item.sentiment)}>
                    {item.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent news found for {symbol}.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StockNewsPanel;
