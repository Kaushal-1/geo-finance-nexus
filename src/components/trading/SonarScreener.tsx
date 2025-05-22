
import React, { useState } from "react";
import { Search, TrendingUp, Newspaper, X, Calendar, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getPerplexityApiKey } from "@/services/chatService";
import { useSonarAnalysis, NewsAnalysisParams } from "@/hooks/useSonarAnalysis";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SonarScreenerProps {
  stockSymbol: string;
}

interface LocalNewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
}

interface StockInsight {
  summary: string;
  healthScore: number;
  citations: Array<{
    text: string;
    url: string;
  }>;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  news: LocalNewsItem[];
}

const SonarScreener: React.FC<SonarScreenerProps> = ({
  stockSymbol
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<StockInsight | null>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [newsTimeframe, setNewsTimeframe] = useState<string>("1month");
  const {
    analysisLoading,
    newsAnalysisData,
    runNewsAnalysis
  } = useSonarAnalysis();

  const runSonarAnalysis = async (type: string) => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      toast({
        title: "Analyzing Stock",
        description: `Running ${type} analysis for ${stockSymbol}...`,
        duration: 3000
      });

      // Get the API key
      const apiKey = getPerplexityApiKey();
      if (!apiKey) {
        throw new Error("Perplexity API key is not set");
      }

      // Construct the query based on the analysis type
      let query = "";
      switch (type) {
        case "comprehensive":
          query = `Provide a comprehensive analysis of ${stockSymbol} stock in May 2025. Include: 1) Recent performance summary, 2) Key news events, 3) Portfolio health assessment, 4) Overall sentiment (Bullish/Bearish/Neutral). Format as JSON with these keys: summary (string), healthScore (number 0-100), sentiment (string: "Bullish", "Bearish", or "Neutral"), citations (array of {text, url}), news (array of {title, summary, source, url, sentiment}).`;
          break;
        case "news":
          // Use the new news analysis hook for news-specific analysis
          const params: NewsAnalysisParams = {
            timeframe: newsTimeframe,
            limit: 8,
            includeMarketNews: true
          };
          await runNewsAnalysis(stockSymbol, params);
          setDialogOpen(true);
          setIsLoading(false);
          return;
        // Early return as we're using the specialized hook
        default:
          query = `Provide key insights about ${stockSymbol} stock as of May 2025, including recent performance, significant news, and market sentiment. Format as JSON with these keys: summary (string), healthScore (number 0-100), sentiment (string: "Bullish", "Bearish", or "Neutral"), citations (array of {text, url}), news (array of {title, summary, source, url, sentiment}).`;
      }

      // Call the Perplexity Sonar API
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [{
            role: "system",
            content: "You are a financial analyst that provides data about stocks in structured JSON format. Use online search to find the most up-to-date information available. Cite your sources in the response. Do not include any markdown formatting in your JSON."
          }, {
            role: "user",
            content: query
          }],
          temperature: 0.2,
          max_tokens: 2000,
          search_recency_filter: "month"
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract JSON from the response, handling potential markdown wrapping
      const jsonContent = content.replace(/```json|```/g, "").trim();
      console.log("Raw JSON content:", jsonContent);
      let parsedData;

      // Handle news-only analysis differently
      if (type === "news") {
        try {
          parsedData = JSON.parse(jsonContent);
          // If it's an array, wrap it in an object structure
          if (Array.isArray(parsedData)) {
            parsedData = {
              news: parsedData,
              summary: "Latest news analysis for " + stockSymbol,
              sentiment: "Neutral",
              // Default
              healthScore: 50,
              // Default
              citations: []
            };
          }
          // If it already has a news property, use it directly
          else if (!parsedData.news) {
            parsedData.news = [];
          }
        } catch (e) {
          console.error("Error parsing news data:", e);
          throw new Error("Could not parse news data");
        }
      } else {
        // For comprehensive analysis
        parsedData = JSON.parse(jsonContent);
      }
      console.log("Parsed data:", parsedData);

      // Set the insight data
      setInsight(parsedData);
      setDialogOpen(true);
      toast({
        title: "Analysis Complete",
        description: `${stockSymbol} analysis completed successfully.`,
        duration: 3000
      });
    } catch (error) {
      console.error("Error running Sonar analysis:", error);
      toast({
        title: "Analysis Failed",
        description: `Could not complete analysis for ${stockSymbol}. ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get color based on sentiment
  const getSentimentColor = (sentiment: string | undefined) => {
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

  // Helper function to get color based on impact
  const getImpactColor = (impact: string | undefined) => {
    if (!impact) return "bg-gray-500";
    switch (impact) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-teal-500";
      default:
        return "text-blue-500";
    }
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const formatNewsDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Sonar Screener
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#1a2035] border-white/10 text-white z-50">
          <DropdownMenuItem onClick={() => runSonarAnalysis("comprehensive")} className="cursor-pointer hover:bg-white/10">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Comprehensive Analysis</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Loading indicator without dialog */}
      {(isLoading || analysisLoading) && (
        <Card className="mt-4 bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
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
      )}

      {/* Dialog for Standard Analysis Results */}
      <Dialog open={dialogOpen && !isLoading && !analysisLoading && insight && newsAnalysisData === null} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-[#1a2035] border border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-xl mr-2">{stockSymbol} Analysis</span>
              <div className={`ml-2 w-3 h-3 rounded-full ${getSentimentColor(insight?.sentiment)}`}></div>
              <Badge className="ml-2" variant={insight?.sentiment === "Bullish" ? "default" : insight?.sentiment === "Bearish" ? "destructive" : "secondary"}>
                {insight?.sentiment}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {insight?.healthScore !== undefined && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-400 mr-2">Health Score:</span>
                <div className="bg-gray-700 rounded-full h-2 w-36 overflow-hidden">
                  <div 
                    className={`h-full ${insight.healthScore >= 70 ? 'bg-green-500' : insight.healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{width: `${insight.healthScore}%`}}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-white">{insight.healthScore}</span>
              </div>
            )}
            
            <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#0f1628] mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="citations">Citations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-0">
                <p className="text-gray-300 text-sm">{insight?.summary}</p>
              </TabsContent>
              
              <TabsContent value="news" className="mt-0">
                {insight?.news && insight.news.length > 0 ? (
                  <div className="space-y-4">
                    {insight.news.map((item, index) => (
                      <div key={index} className="p-3 border border-white/10 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-white text-sm">{item.title}</h4>
                          <div className={`ml-2 w-2 h-2 rounded-full ${getSentimentColor(item.sentiment)}`}></div>
                        </div>
                        <p className="text-[#a0aec0] text-xs mb-2">{item.summary}</p>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white">{item.source}</span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:text-blue-300">
                            <span>Source</span>
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
                {insight?.citations && insight.citations.length > 0 ? (
                  <div className="space-y-2">
                    {insight.citations.map((citation, index) => (
                      <div key={index} className="flex gap-2 items-start p-2 rounded hover:bg-white/5">
                        <span className="text-gray-400 text-sm">{index + 1}.</span>
                        <div>
                          <p className="text-sm text-gray-300">{citation.text}</p>
                          <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center mt-1">
                            {citation.url.replace(/https?:\/\//, '').split('/')[0]}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for News Analysis Results */}
      <Dialog open={dialogOpen && !isLoading && !analysisLoading && newsAnalysisData !== null} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-[#1a2035] border border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="text-xl mr-2">{stockSymbol} News Analysis</span>
              <div className={`ml-2 w-3 h-3 rounded-full ${getSentimentColor(newsAnalysisData?.sentiment)}`}></div>
              <Badge className="ml-2" variant={newsAnalysisData?.sentiment === "Bullish" ? "default" : newsAnalysisData?.sentiment === "Bearish" ? "destructive" : "secondary"}>
                {newsAnalysisData?.sentiment}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {newsAnalysisData?.healthScore !== undefined && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-400 mr-2">Health Score:</span>
                <div className="bg-gray-700 rounded-full h-2 w-36 overflow-hidden">
                  <div 
                    className={`h-full ${newsAnalysisData.healthScore >= 70 ? 'bg-green-500' : newsAnalysisData.healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                    style={{width: `${newsAnalysisData.healthScore}%`}}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-white">{newsAnalysisData.healthScore}</span>
              </div>
            )}
            
            <div className="mt-3">
              <p className="text-gray-300 text-sm">{newsAnalysisData?.summary}</p>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <h4 className="text-white text-sm font-medium">Recent News</h4>
              <Select 
                value={newsTimeframe} 
                onValueChange={value => {
                  setNewsTimeframe(value);
                  runNewsAnalysis(stockSymbol, {
                    timeframe: value
                  });
                }}
              >
                <SelectTrigger className="w-28 h-8 bg-black/30 border-white/10 text-white text-xs">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2035] border-white/10">
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {newsAnalysisData?.newsItems && newsAnalysisData.newsItems.length > 0 ? (
                newsAnalysisData.newsItems.map((item, index) => (
                  <Card key={index} className="bg-black/30 border-white/5 overflow-hidden flex flex-col">
                    <CardContent className="p-3 flex flex-col h-full">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-white text-sm line-clamp-2">{item.title}</h5>
                        <Badge className={`ml-1 ${item.sentiment === "Bullish" ? 'bg-green-700' : item.sentiment === "Bearish" ? 'bg-red-700' : 'bg-blue-700'} text-[10px]`}>
                          {item.sentiment}
                        </Badge>
                      </div>
                      <p className="text-[#a0aec0] text-xs mt-1 line-clamp-3 flex-grow">{item.summary}</p>
                      <div className="flex justify-between items-center mt-2 text-[10px]">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-gray-400">{formatNewsDate(item.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${getImpactColor(item.impact)}`}>
                            {item.impact} Impact
                          </span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-gray-400">
                  No news data available for this timeframe.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SonarScreener;
