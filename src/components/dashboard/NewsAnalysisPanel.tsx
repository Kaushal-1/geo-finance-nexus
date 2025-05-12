
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw, X, AlertCircle } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const NewsAnalysisPanel = () => {
  const { newsItems, loadingNews, refreshNews, selectedRegion } = useDashboard();
  const [isOpen, setIsOpen] = useState(true);

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div 
      className={`absolute top-0 left-0 h-full z-10 transition-all duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-[calc(-100%+44px)]"
      }`}
    >
      {/* Toggle button */}
      <div 
        className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-[20px] bg-black/40 backdrop-blur-md rounded-r-lg p-2 cursor-pointer z-20 border border-l-0 border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5 text-white/70" /> : <ChevronRight className="h-5 w-5 text-white/70" />}
      </div>
      
      {/* Main panel */}
      <div className="h-full w-[320px] bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">News & Analysis</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              disabled={loadingNews}
              onClick={() => refreshNews(selectedRegion || "global")}
            >
              <RefreshCw className={`h-4 w-4 ${loadingNews ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-3 space-y-4">
          {loadingNews ? (
            // Show skeletons while loading
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-black/30 border border-white/10 text-white">
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-3/4 bg-white/10 mb-2" />
                  <Skeleton className="h-3 w-full bg-white/10 mb-1" />
                  <Skeleton className="h-3 w-5/6 bg-white/10 mb-1" />
                  <Skeleton className="h-3 w-2/3 bg-white/10 mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-1/4 bg-white/10" />
                    <Skeleton className="h-3 w-1/5 bg-white/10" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : newsItems.length > 0 ? (
            // Show news items
            newsItems.map((item) => (
              <Card key={item.id} className="bg-black/30 border border-white/10 text-white hover:bg-black/40 transition-colors">
                <CardContent className="p-3">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-teal transition-colors group">
                      {item.title}
                      <ExternalLink className="inline h-3 w-3 ml-1 opacity-50 group-hover:opacity-100" />
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-3 mb-2">{item.summary}</p>
                    <div className="flex justify-between items-center text-xs text-white/50">
                      <div className="flex items-center">
                        <span>{item.source}</span>
                        <span 
                          className={`inline-block w-2 h-2 rounded-full ml-1.5 ${
                            item.sourceCredibility > 0.8 ? "bg-green-500" : "bg-yellow-500"
                          }`} 
                          title={`Source credibility: ${(item.sourceCredibility * 100).toFixed(0)}%`}
                        />
                      </div>
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  </a>
                </CardContent>
              </Card>
            ))
          ) : (
            // Show empty state
            <div className="flex flex-col items-center justify-center h-full text-white/50 p-4">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-center">No news available for this region</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-white/20 text-white"
                onClick={() => refreshNews(selectedRegion || "global")}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        {selectedRegion && (
          <div className="p-3 border-t border-white/10 bg-black/20">
            <p className="text-xs text-white/60">
              Showing news for <span className="text-teal font-medium">{selectedRegion}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsAnalysisPanel;
