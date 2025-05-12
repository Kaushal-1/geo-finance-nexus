
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';

// Mock news data
const newsData = [
  {
    id: 1,
    title: "Fed signals potential rate cuts in coming months",
    summary: "Federal Reserve Chair Jerome Powell indicated the central bank could begin reducing interest rates as early as March if inflation continues to ease.",
    source: "Financial Times",
    credibilityScore: 92,
    impact: "High",
    impactColor: "#ff5252", // red for high impact
    timestamp: "2h ago",
    category: "Policy"
  },
  {
    id: 2,
    title: "Tech sector rally continues with AI-driven momentum",
    summary: "Technology stocks extend their gains as artificial intelligence investments continue to drive market enthusiasm despite valuation concerns.",
    source: "Market Watch",
    credibilityScore: 87,
    impact: "Medium",
    impactColor: "#7b61ff", // purple for medium impact
    timestamp: "4h ago",
    category: "Markets"
  },
  {
    id: 3,
    title: "Oil prices stabilize after Middle East tensions ease",
    summary: "Crude oil futures find support at key technical levels as diplomatic efforts reduce concerns about supply disruptions in the region.",
    source: "Reuters",
    credibilityScore: 95,
    impact: "Low",
    impactColor: "#00b8d4", // teal for low impact
    timestamp: "6h ago",
    category: "Commodities"
  },
  {
    id: 4,
    title: "European banks exceed profit expectations in Q4",
    summary: "Major European financial institutions report stronger-than-anticipated earnings, boosted by higher interest rates and effective cost management strategies.",
    source: "Bloomberg",
    credibilityScore: 94,
    impact: "Medium",
    impactColor: "#7b61ff",
    timestamp: "8h ago",
    category: "Earnings"
  },
  {
    id: 5,
    title: "Asia-Pacific markets mixed as investors assess economic data",
    summary: "Regional equities show divergent performance with Japanese stocks declining while Chinese markets advance on manufacturing activity improvement.",
    source: "CNBC",
    credibilityScore: 85,
    impact: "Low",
    impactColor: "#00b8d4",
    timestamp: "10h ago",
    category: "Markets"
  }
];

// Available categories for filtering
const categories = ["All", "Policy", "Markets", "Commodities", "Earnings", "Economy"];

const NewsItem = ({ item }: { item: any }) => (
  <div className="p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 animate-fade-in">
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-medium text-white text-sm">{item.title}</h3>
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
      <span className="text-[#a0aec0]">{item.timestamp}</span>
    </div>
  </div>
);

const NewsPanel = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Filter news by selected category
  const filteredNews = selectedCategory === "All" 
    ? newsData 
    : newsData.filter(news => news.category === selectedCategory);

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
                  ? 'bg-teal text-white' 
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
        {filteredNews.map(item => (
          <NewsItem key={item.id} item={item} />
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <Button variant="outline" className="w-full bg-transparent border-white/10 text-[#a0aec0] hover:text-white hover:bg-white/10">
          View All News
        </Button>
      </div>
    </Card>
  );
};

export default NewsPanel;
