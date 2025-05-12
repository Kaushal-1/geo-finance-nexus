
import { useState, useEffect } from 'react';
import { finnhubService } from '@/services/finnhubService';
import { useToast } from '@/components/ui/use-toast';
import { mockNewsData } from '@/services/newsService';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: string;
  image?: string;
  category: string;
  credibilityScore: number;
  impact: string;
  impactColor: string;
}

export function useNewsData() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { toast } = useToast();

  // Available news categories
  const categories = ['All', 'Markets', 'Economy', 'Technology', 'Crypto'];

  useEffect(() => {
    let isMounted = true;
    
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get news from Finnhub API
        const newsData = await finnhubService.getMarketNews();
        
        if (!isMounted) return;
        
        setNews(newsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        
        if (!isMounted) return;
        
        setError('Could not fetch news data. Using fallback data.');
        setLoading(false);
        
        // Show error toast
        toast({
          title: 'News Fetch Error',
          description: 'Could not fetch the latest financial news. Using fallback data.',
          variant: 'destructive',
        });
        
        // Load fallback data from the mockNewsData array
        if (mockNewsData) {
          setNews(mockNewsData);
        }
      }
    };
    
    fetchNews();
    
    // Set up polling interval - refresh news every 5 minutes
    const pollInterval = setInterval(fetchNews, 300000);
    
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);
  
  // Filter news when selected category or news items change
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      ));
    }
  }, [selectedCategory, news]);

  return {
    news: filteredNews,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
  };
}
