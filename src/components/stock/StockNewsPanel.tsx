
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLinkIcon } from 'lucide-react';

interface NewsItem {
  id: string | number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  timestamp: Date;
  image?: string;
  sentiment: string;
}

interface StockNewsPanelProps {
  news: NewsItem[];
}

const StockNewsPanel: React.FC<StockNewsPanelProps> = ({ news }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  if (!news || !Array.isArray(news)) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No news data available.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter news based on active filter
  const filteredNews = activeFilter === 'all' 
    ? news 
    : news.filter(item => item.sentiment && item.sentiment.includes(activeFilter));
  
  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: Date) => {
    if (!timestamp) return 'Unknown date';
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  // Get sentiment styling
  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes('positive')) return 'bg-green-500/20 text-green-500';
    if (sentiment.includes('negative')) return 'bg-red-500/20 text-red-500';
    return 'bg-gray-500/20 text-gray-400';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            size="sm"
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
          >
            All News
          </Button>
          <Button 
            size="sm"
            variant={activeFilter === 'positive' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('positive')}
          >
            Positive
          </Button>
          <Button 
            size="sm"
            variant={activeFilter === 'negative' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('negative')}
          >
            Negative
          </Button>
          <Button 
            size="sm"
            variant={activeFilter === 'neutral' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('neutral')}
          >
            Neutral
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredNews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No news found matching the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredNews.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                {item.image ? (
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.headline} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Replace broken image with placeholder
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/60x60?text=News';
                      }} 
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-16 h-16 rounded bg-muted flex items-center justify-center text-muted-foreground">
                    News
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-sm">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors flex items-center"
                    >
                      {item.headline}
                      <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{getRelativeTime(item.timestamp)}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockNewsPanel;
