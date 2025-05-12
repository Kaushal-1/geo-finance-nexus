
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bot, ChevronLeft, Settings, MessageCircle } from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import VisualizationPanel from "@/components/chat/VisualizationPanel";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import ApiKeyInput from "@/components/chat/ApiKeyInput";
import { useToast } from "@/components/ui/use-toast";
import { useChatState } from "@/hooks/useChatState";
import { getPerplexityApiKey } from "@/services/chatService";

const ChatResearch = () => {
  const {
    messages,
    loading,
    activeVisualization,
    suggestedQuestions,
    sendMessage,
    setActiveVisualization
  } = useChatState();
  const [inputMessage, setInputMessage] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for API key on load
  useEffect(() => {
    const apiKey = getPerplexityApiKey();
    setHasApiKey(!!apiKey);
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Perplexity API key in settings to enable the assistant.",
        variant: "destructive",
        duration: 6000
      });
    }
  }, [toast]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputMessage.trim() === "") return;
    const userMessage = inputMessage;
    setInputMessage("");
    await sendMessage(userMessage);
  };

  const handleSuggestedQuestion = async (question: string) => {
    setInputMessage(question);
    await sendMessage(question);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-teal-400" />
              <h1 className="text-lg font-semibold md:text-xl">Market Research Assistant</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full ${!hasApiKey ? 'animate-pulse text-amber-400' : ''}`} 
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="space-y-4 pt-4">
                  <h2 className="text-xl font-semibold">Assistant Settings</h2>
                  <div className="space-y-2">
                    <h3 className="font-medium">API Configuration</h3>
                    <ApiKeyInput />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Chat Panel */}
        <div className="relative flex-1 flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-400">
                <Bot className="h-16 w-16 text-gray-300" />
                <div>
                  <h3 className="text-xl font-medium text-gray-200">Financial Research Assistant</h3>
                  <p className="mt-1 max-w-md text-sm">
                    Ask questions about markets, stocks, and economic events to get AI-powered insights with visualizations.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-2">
                  {["How will rising interest rates affect tech stocks?", "Compare Apple and Microsoft's performance this quarter", "Explain the impact of Fed announcements on banking stocks", "What regions are affected by semiconductor shortages?", "Show me historical patterns of market reactions to similar events"].map(question => (
                    <Button 
                      key={question} 
                      variant="outline" 
                      className="h-auto justify-start border-gray-700 py-3 text-left text-xs hover:bg-gray-800 md:text-sm" 
                      onClick={() => handleSuggestedQuestion(question)} 
                      disabled={!hasApiKey}
                    >
                      <MessageCircle className="mr-2 h-3.5 w-3.5" />
                      {question}
                    </Button>
                  ))}
                </div>
                
                {!hasApiKey && (
                  <div className="mt-4 rounded-md border border-amber-900/50 bg-amber-900/20 p-3 text-sm text-amber-200">
                    <h4 className="mb-1 font-medium">API Key Required</h4>
                    <p>Please set your Perplexity API key in the settings to enable the assistant.</p>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2 border-amber-500/30 bg-amber-900/30 text-amber-200 hover:bg-amber-900/50">
                          <Settings className="mr-1 h-3 w-3" />
                          Open Settings
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <div className="space-y-4 pt-4">
                          <h2 className="text-xl font-semibold">Assistant Settings</h2>
                          <div className="space-y-2">
                            <h3 className="font-medium">API Configuration</h3>
                            <ApiKeyInput />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="relative">
                <Input 
                  ref={inputRef} 
                  value={inputMessage} 
                  onChange={e => setInputMessage(e.target.value)} 
                  placeholder="Ask about financial markets, stocks, or economic events..." 
                  className="bg-gray-900 pr-12 text-white" 
                  disabled={loading || !hasApiKey} 
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-1 top-1 h-8 w-8 rounded-md" 
                  disabled={loading || !inputMessage.trim() || !hasApiKey}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && (
                <SuggestedQuestions 
                  questions={suggestedQuestions} 
                  onSelectQuestion={handleSuggestedQuestion} 
                />
              )}
            </form>
          </div>
        </div>
        
        {/* Visualization Panel (shows only when there's active visualization) */}
        {activeVisualization && (
          <div className="w-full md:w-1/2 h-full border-l border-white/10 bg-black/20 backdrop-blur-sm">
            <VisualizationPanel 
              visualization={activeVisualization} 
              onClose={() => setActiveVisualization(null)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatResearch;
