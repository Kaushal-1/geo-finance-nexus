
import { useState, useEffect } from 'react';
import { finnhubService } from '@/services/finnhubService';
import { useToast } from '@/components/ui/use-toast';
import { mockNewsData } from '@/services/newsService';
import { fetchFinancialNews } from '@/services/newsService';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  url: string;
  timestamp: string;
  image?: string;
  category: string;
  credibilityScore: number;
  impact: string;
  impactColor: string;
}

export function useNewsData(region: string = 'global') {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { toast } = useToast();

  // Available news categories
  const categories = ['All', 'Markets', 'Economy', 'Policy', 'Technology', 'Crypto'];

  useEffect(() => {
    let isMounted = true;
    
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch news from Perplexity Sonar API first
        let newsData = await fetchFinancialNews(region);
        
        // If no data or error, fall back to Finnhub API
        if (!newsData || newsData.length === 0) {
          newsData = await finnhubService.getMarketNews();
        }
        
        if (!isMounted) return;
        
        // Process and add color coding for impact levels
        const processedNews = newsData.map((item: any) => ({
          ...item,
          impactColor: item.impact === 'High' ? '#ff5252' : item.impact === 'Medium' ? '#7b61ff' : '#00b8d4'
        }));
        
        setNews(processedNews);
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
  }, [region]);
  
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
