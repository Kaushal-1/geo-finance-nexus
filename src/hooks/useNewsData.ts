
import { useState, useEffect } from 'react';
import { fetchFinancialNews, mockNewsData } from '@/services/newsService';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  credibilityScore?: number;
  impact: string;
  impactColor: string;
  timestamp: string;
  category: string;
  sentiment: string;
}

const getImpactColor = (impact: string): string => {
  switch (impact.toLowerCase()) {
    case 'high': return '#ff5252'; // red
    case 'medium': return '#7b61ff'; // purple
    default: return '#00b8d4'; // teal
  }
};

export function useNewsData(region = 'global', topic = 'financial markets') {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    
    const loadNews = async () => {
      try {
        setLoading(true);
        const fetchedNews = await fetchFinancialNews(region, topic);
        
        if (!isMounted) return;
        
        if (fetchedNews.length > 0) {
          const processedNews: NewsItem[] = fetchedNews.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            source: item.source,
            sourceUrl: item.sourceUrl,
            credibilityScore: Math.floor(Math.random() * 15) + 80, // Random score between 80-95
            impact: item.impact,
            impactColor: getImpactColor(item.impact),
            timestamp: new Date(item.timestamp).toLocaleString(),
            category: item.category || 'Markets',
            sentiment: item.sentiment || 'neutral'
          }));
          setNews(processedNews);
        } else {
          // Use mock data as fallback
          setNews(mockNewsData.map(item => ({
            ...item,
            impactColor: getImpactColor(item.impact),
            credibilityScore: Math.floor(Math.random() * 15) + 80,
            timestamp: new Date(item.timestamp).toLocaleString()
          })));
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error in useNewsData:', err);
        setError('Failed to fetch news data');
        
        // Fallback to mock data
        setNews(mockNewsData.map(item => ({
          ...item,
          impactColor: getImpactColor(item.impact),
          credibilityScore: Math.floor(Math.random() * 15) + 80,
          timestamp: new Date(item.timestamp).toLocaleString()
        })));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNews();
    
    return () => {
      isMounted = false;
    };
  }, [region, topic]);

  const filteredNews = selectedCategory === 'All' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const categories = ['All', ...Array.from(new Set(news.map(item => item.category)))];

  return {
    news: filteredNews,
    allNews: news,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory
  };
}
