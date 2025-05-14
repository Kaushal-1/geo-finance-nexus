
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { useNewsData } from '@/hooks/useNewsData';
import { Skeleton } from '@/components/ui/skeleton';

const NewsItem = ({ item }: { item: any }) => {
  const handleNewsClick = () => {
    // Open in new tab with smooth transition effect
    const newWindow = window.open(item.sourceUrl, '_blank');
    if (newWindow) newWindow.focus();
  };

  return (
    <div 
      className="p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 animate-fade-in cursor-pointer group"
      onClick={handleNewsClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium text-white text-sm group-hover:text-teal-400 transition-colors">{item.title}</h3>
        <span 
          className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap" 
          style={{ backgroundColor: `${item.impactColor}30`, color: item.impactColor }}
        >
          {item.impact}
        </span>
      </div>
      
      <p className="text-[#a0aec0] text-xs mb-2 line-clamp-2">{item.summary}</p>
      
      <div className="flex justify-between items-center text-[10px]">
        <div className="flex items-center">
          <span className="text-white">{item.source}</span>
          <span className="mx-1 text-[#a0aec0]">•</span>
          <span className={`${item.credibilityScore > 90 ? 'text-[#00e676]' : 'text-[#a0aec0]'}`}>
            {item.credibilityScore}% reliable
          </span>
        </div>
        <div className="flex items-center text-[#a0aec0] opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="h-3 w-3 mr-1" />
          <span>View Source</span>
        </div>
      </div>
    </div>
  );
};

const NewsPanel = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { 
    news, 
    loading, 
    error, 
    categories, 
    selectedCategory, 
    setSelectedCategory 
  } = useNewsData();
  
  if (collapsed) {
    return (
      <div className="h-full flex">
        <button 
          onClick={() => setCollapsed(false)}
          className="h-full w-8 bg-[#1a2035]/80 backdrop-blur-sm rounded-r-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Card className="h-full bg-[#1a2035]/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="text-lg font-medium text-white">Financial News</h2>
        <button 
          onClick={() => setCollapsed(true)}
          className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronUp className="h-4 w-4 text-white" />
        </button>
      </div>
      
      <div className="p-4 border-b border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex space-x-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`
                text-xs py-1 h-auto
                ${selectedCategory === category 
                  ? 'bg-teal-600 text-white hover:bg-teal-700' 
                  : 'bg-transparent border-white/10 text-[#a0aec0] hover:text-white hover:bg-white/10'}
              `}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-3">
        {loading ? (
          // Loading state
          Array(5).fill(0).map((_, index) => (
            <div key={index} className="p-3 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-12 bg-white/10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full bg-white/10 mb-1" />
              <Skeleton className="h-3 w-5/6 bg-white/10 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-2 w-24 bg-white/10" />
                <Skeleton className="h-2 w-16 bg-white/10" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-white">
            <p>Could not load news data. Using fallback data.</p>
          </div>
        ) : news.length > 0 ? (
          news.map(item => <NewsItem key={item.id} item={item} />)
        ) : (
          <div className="p-4 border border-white/10 rounded-lg text-white/50 text-center">
            <p>No news available for the selected category.</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <Button 
          variant="outline" 
          className="w-full bg-transparent border-white/10 text-[#a0aec0] hover:text-white hover:bg-white/10"
          onClick={() => window.open('https://finnhub.io/news', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View All Financial News
        </Button>
      </div>
    </Card>
  );
};

export default NewsPanel;
