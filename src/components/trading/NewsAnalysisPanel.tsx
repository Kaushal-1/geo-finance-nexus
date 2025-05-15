
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, X } from "lucide-react";
import { type NewsItem } from "@/hooks/useSonarAnalysis";

interface NewsAnalysisPanelProps {
  loading: boolean;
  summary?: string | null;
  healthScore?: number | null;
  sentiment?: "Bullish" | "Bearish" | "Neutral" | null;
  newsItems?: NewsItem[];
  citations?: Array<{ text: string; url: string }>;
  onClose?: () => void;
  symbol?: string;
}

const NewsAnalysisPanel: React.FC<NewsAnalysisPanelProps> = ({
  loading,
  summary,
  healthScore,
  sentiment,
  newsItems = [],
  citations = [],
  onClose,
  symbol = "",
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // Helper function to get color based on sentiment
  const getSentimentColor = (sentiment: string | undefined | null) => {
    if (!sentiment) return "bg-gray-500";
    
    switch (sentiment) {
      case "Bullish":
        return "bg-green-500";
      case "Bearish":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getSentimentVariant = (sentiment: string | undefined | null) => {
    if (!sentiment) return "secondary";
    
    switch (sentiment) {
      case "Bullish":
        return "default";
      case "Bearish":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] bg-white/10" />
                <Skeleton className="h-4 w-[200px] bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-3/4 bg-white/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10 relative">
      {onClose && (
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-800/50 hover:bg-gray-700/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-xl font-semibold text-white">{symbol || "Market"} Analysis</CardTitle>
            {sentiment && (
              <>
                <div className={`ml-3 w-3 h-3 rounded-full ${getSentimentColor(sentiment)}`}></div>
                <Badge className="ml-2" variant={getSentimentVariant(sentiment)}>
                  {sentiment}
                </Badge>
              </>
            )}
          </div>
          
          {healthScore !== null && healthScore !== undefined && (
            <div className="flex items-center">
              <span className="text-sm text-gray-400 mr-2">Health Score:</span>
              <div className="bg-gray-700 rounded-full h-2 w-36 overflow-hidden">
                <div 
                  className={`h-full ${
                    healthScore >= 70 ? 'bg-green-500' : 
                    healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-white">{healthScore}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0f1628] mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="citations">Citations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            {summary ? (
              <p className="text-gray-300 text-sm">{summary}</p>
            ) : (
              <p className="text-gray-400 text-sm">No summary available.</p>
            )}
          </TabsContent>
          
          <TabsContent value="news" className="mt-0">
            {newsItems && newsItems.length > 0 ? (
              <div className="space-y-4">
                {newsItems.map((item, index) => (
                  <div key={index} className="p-3 border border-white/10 rounded-lg bg-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white text-sm">{item.title}</h4>
                      <div className={`ml-2 w-2 h-2 rounded-full ${getSentimentColor(item.sentiment)}`}></div>
                    </div>
                    <p className="text-[#a0aec0] text-xs mb-2">{item.summary}</p>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white">{item.source}</span>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300"
                      >
                        <span>Source</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No news data available.</p>
            )}
          </TabsContent>
          
          <TabsContent value="citations" className="mt-0">
            {citations && citations.length > 0 ? (
              <div className="space-y-2">
                {citations.map((citation, index) => (
                  <div key={index} className="flex gap-2 items-start p-2 rounded hover:bg-white/5">
                    <span className="text-gray-400 text-sm">{index + 1}.</span>
                    <div>
                      <p className="text-sm text-gray-300">{citation.text}</p>
                      <a 
                        href={citation.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center mt-1"
                      >
                        {citation.url.replace(/https?:\/\//, '').split('/')[0]}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No citation data available.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NewsAnalysisPanel;
