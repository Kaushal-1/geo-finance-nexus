import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lightbulb, Send, RefreshCw, Ban, AlertTriangle, ArrowUpRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';

import { useToast } from "@/components/ui/use-toast";
import { useChatState } from "@/hooks/useChatState";
import { usePortfolioContext } from "@/hooks/usePortfolioContext";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import VisualizationPanel from "@/components/chat/VisualizationPanel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ChatResearch = () => {
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem("openai_api_key") || ""
  );
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [maxLength, setMaxLength] = useState(4096);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [showRawJson, setShowRawJson] = useState(false);
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [showPortfolioContext, setShowPortfolioContext] = useState(true);
  const [displayedSuggestions, setDisplayedSuggestions] = useState<string[]>([]);

  // Get portfolio context data from Alpaca
  const { 
    account, 
    positions, 
    orders, 
    portfolioSummary,
    isLoading: isLoadingPortfolio, 
    error: portfolioError,
    lastRefreshed,
    refreshData: refreshPortfolioData
  } = usePortfolioContext();

  const {
    messages,
    loading: isLoading,
    activeVisualization: visualization,
    suggestedQuestions,
    sendMessage,
    setActiveVisualization,
    clearChat,
  } = useChatState();

  // Update displayed suggestions whenever suggestedQuestions changes
  useEffect(() => {
    if (suggestedQuestions.length > 0) {
      // Shuffle the array and pick 2 random questions
      const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
      setDisplayedSuggestions(shuffled.slice(0, 2));
    } else {
      setDisplayedSuggestions([]);
    }
  }, [suggestedQuestions]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }, [apiKey]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputText.trim()) {
      // Pass the portfolio context to the sendMessage function
      sendMessage(inputText, showPortfolioContext ? portfolioSummary : null);
      setInputText("");
    }
  };

  const handleClearChat = () => {
    clearChat();
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const handleRefreshPortfolio = () => {
    refreshPortfolioData();
    toast({
      title: "Portfolio Data Refreshed",
      description: "Your Alpaca portfolio data has been updated.",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const removeQuestion = (index: number) => {
    setDisplayedSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  // Function to render message content with proper formatting using ReactMarkdown
  const renderMessageContent = (content: string, sender: 'user' | 'ai', sources?: any[]) => {
    if (sender === 'user') {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return (
      <>
        <ReactMarkdown 
          className="whitespace-pre-wrap text-gray-100 prose prose-invert prose-headings:my-3 prose-h2:text-lg prose-h2:font-semibold prose-h3:text-md prose-h3:font-semibold prose-p:mb-2"
        >
          {content}
        </ReactMarkdown>
        
        {sources && sources.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Sources:</p>
            <ol className="text-xs text-gray-400 list-decimal pl-4 space-y-1">
              {sources.map((source, idx) => (
                <li key={idx}>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center"
                  >
                    {source.title} - {source.publisher}
                    <ArrowUpRight size={12} className="inline ml-1" />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa]">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">AI Research Assistant</h1>
            <p className="text-gray-400">
              Get real-time insights and analysis powered by AI.
            </p>
          </div>
          
          {/* Portfolio context toggle */}
          <div className="flex items-center space-x-3">
            <Label htmlFor="portfolio-context" className="flex items-center text-sm cursor-pointer">
              <span className="mr-2">Portfolio Context</span>
              <Switch
                id="portfolio-context"
                checked={showPortfolioContext}
                onCheckedChange={setShowPortfolioContext}
              />
            </Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPortfolio}
              disabled={isLoadingPortfolio}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPortfolio ? 'animate-spin' : ''}`} /> 
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6 h-[85vh]">
          {/* Portfolio context panel - visible on larger screens */}
          {showPortfolioContext && (
            <div className="hidden lg:block w-full lg:w-1/4">
              <Card className="h-full border border-white/10 rounded-xl bg-black/40 backdrop-blur-md overflow-hidden">
                <CardHeader className="py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Portfolio</h2>
                    <div className="flex items-center">
                      {lastRefreshed && (
                        <span className="text-xs text-gray-400 mr-2">
                          Updated: {formatDate(lastRefreshed)}
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleRefreshPortfolio}
                        disabled={isLoadingPortfolio}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingPortfolio ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 overflow-hidden">
                  <ScrollArea className="h-[calc(85vh-8rem)]">
                    {isLoadingPortfolio ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full bg-gray-800" />
                        <Skeleton className="h-20 w-full bg-gray-800" />
                        <Skeleton className="h-32 w-full bg-gray-800" />
                      </div>
                    ) : portfolioError ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 mx-auto text-red-400 mb-2" />
                        <p className="text-red-400">{portfolioError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={handleRefreshPortfolio}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Account Summary</h3>
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">Total Equity</span>
                              <span className="font-semibold">${parseFloat(account?.equity || '0').toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">Cash</span>
                              <span>${parseFloat(account?.cash || '0').toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Buying Power</span>
                              <span>${parseFloat(account?.buying_power || '0').toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Positions ({positions?.length || 0})</h3>
                          <div className="space-y-2">
                            {positions && positions.length > 0 ? (
                              positions.slice(0, 5).map((position) => (
                                <div 
                                  key={position.symbol} 
                                  className="bg-gray-800/50 rounded-lg p-3 flex justify-between"
                                >
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium">{position.symbol}</span>
                                      <Badge variant={parseFloat(position.unrealized_pl) >= 0 ? "success" : "destructive"} className="ml-2 text-xs">
                                        {parseFloat(position.unrealized_plpc) > 0 ? '+' : ''}
                                        {(parseFloat(position.unrealized_plpc) * 100).toFixed(2)}%
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {position.qty} shares at ${parseFloat(position.avg_entry_price).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div>${parseFloat(position.market_value).toLocaleString()}</div>
                                    <div className={`text-xs mt-1 ${
                                      parseFloat(position.unrealized_pl) >= 0 
                                        ? 'text-green-400' 
                                        : 'text-red-400'
                                    }`}>
                                      {parseFloat(position.unrealized_pl) > 0 ? '+' : ''}
                                      ${parseFloat(position.unrealized_pl).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-400">
                                <Ban className="h-6 w-6 mx-auto mb-2" />
                                No positions found
                              </div>
                            )}
                            {positions && positions.length > 5 && (
                              <div className="text-center text-sm text-gray-400 mt-2">
                                +{positions.length - 5} more positions
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Orders</h3>
                          <div className="space-y-2">
                            {orders && orders.length > 0 ? (
                              orders.slice(0, 3).map((order) => (
                                <div 
                                  key={order.id} 
                                  className="bg-gray-800/50 rounded-lg p-3"
                                >
                                  <div className="flex justify-between">
                                    <div className="font-medium">{order.symbol}</div>
                                    <Badge variant={order.side === 'buy' ? "outline" : "secondary"}>
                                      {order.side.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {order.qty} shares at ${parseFloat(order.limit_price || order.filled_avg_price || '0').toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(order.submitted_at).toLocaleString()}
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {order.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-400">
                                <Ban className="h-6 w-6 mx-auto mb-2" />
                                No recent orders
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat panel */}
          <Card className="flex-1 flex flex-col border border-white/10 rounded-xl bg-black/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold">Market Research Chat</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleClearChat}>
                    Clear Chat
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-6 pb-4">
                  {/* Welcome message */}
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Welcome to Market Research</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Ask questions about financial markets, companies, and investment strategies. 
                        {showPortfolioContext && " I'll provide insights relevant to your portfolio."}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
                        {displayedSuggestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start overflow-hidden text-left"
                            onClick={() => setInputText(question)}
                          >
                            <span className="truncate">{question}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                
                  {/* Chat messages */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-900/40 ml-8"
                          : "bg-gray-800/80 mr-8"
                      }`}
                    >
                      {renderMessageContent(message.content, message.sender, message.sources)}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="p-4 rounded-lg bg-gray-800/80 mr-8">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                        <span className="text-gray-400 ml-1">Analyzing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Suggested questions after messages */}
              {messages.length > 0 && displayedSuggestions.length > 0 && !isLoading && (
                <div className="mb-4 mt-2">
                  <p className="text-sm text-gray-400 mb-2">Suggested questions:</p>
                  <SuggestedQuestions 
                    questions={displayedSuggestions} 
                    onSelectQuestion={setInputText} 
                    onRemoveQuestion={removeQuestion}
                  />
                </div>
              )}

              {/* Chat input */}
              <form onSubmit={handleSubmit} className="mt-auto">
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder={showPortfolioContext ? 
                      "Ask about markets, stocks, or your portfolio..." : 
                      "Ask about markets, stocks, or investment strategies..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-gray-700 border-gray-600 text-white rounded-md resize-none"
                  />
                  <Button type="submit" disabled={isLoading || !inputText.trim()}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatResearch;
