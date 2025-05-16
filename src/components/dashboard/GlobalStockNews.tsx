
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { getPerplexityApiKey } from '@/services/chatService';
import { useToast } from '@/components/ui/use-toast';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  country: string;
  date: string;
}

const GlobalStockNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGlobalNews = async () => {
      try {
        const apiKey = getPerplexityApiKey();
        
        if (!apiKey) {
          toast({
            title: "API Key Missing",
            description: "Please set the Perplexity API key in your account settings.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a financial news reporter that provides the latest stock market news from around the world. Format your response as structured JSON.'
              },
              {
                role: 'user',
                content: `Provide the 10 most important recent stock market news from major global markets including the US, Europe, Asia, and emerging markets. Include news that would significantly impact investors. Format as JSON array with the following properties for each news item:
                [
                  {
                    "title": "Clear headline",
                    "summary": "Brief 1-2 sentence summary",
                    "source": "News source name",
                    "url": "URL to source article",
                    "country": "Country or region affected",
                    "date": "Publication date"
                  }
                ]`
              }
            ],
            temperature: 0.2,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch global news');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON from the response
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```([\s\S]*?)```/) ||
                          content.match(/{[\s\S]*}/) || 
                          null;
        
        let parsedNews = [];
        
        if (jsonMatch) {
          parsedNews = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          parsedNews = JSON.parse(content);
        }
        
        setNews(parsedNews);
        
      } catch (error) {
        console.error('Error fetching global news:', error);
        toast({
          title: "News Fetch Error",
          description: "Failed to load global stock market news.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalNews();
  }, [toast]);

  return (
    <div className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full">
      <h2 className="text-lg font-semibold text-white mb-2">Global Stock Market News</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 bg-white/10 mb-1" />
                <Skeleton className="h-4 w-full bg-white/10" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-2">
          <p className="text-gray-400">No news available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "calc(100% - 40px)" }}>
          {news.map((item, index) => (
            <div 
              key={index} 
              className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10 transition-all duration-300"
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-white text-sm mb-1">{item.title}</h3>
                <span className="text-xs bg-teal-600/20 text-teal-400 px-2 py-0.5 rounded-full">
                  {item.country}
                </span>
              </div>
              <p className="text-gray-300 text-xs mb-2">{item.summary}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{item.source} • {new Date(item.date).toLocaleDateString()}</span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-teal-400 hover:text-teal-300"
                >
                  Source <ArrowUpRight size={12} className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalStockNews;
