
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bot, ChevronLeft, Send, Settings } from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import VisualizationPanel from "@/components/chat/VisualizationPanel";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import { useToast } from "@/components/ui/use-toast";
import { useChatState } from "@/hooks/useChatState";

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
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isVisualizationOpen, setIsVisualizationOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  const toggleVisualization = () => {
    setIsVisualizationOpen(!isVisualizationOpen);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa]">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat Panel */}
        <div className={`relative flex h-full flex-col transition-all duration-300 ${isPanelExpanded ? "w-0 overflow-hidden" : isVisualizationOpen ? "w-1/2" : "w-full"}`}>
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
                  {["How will rising interest rates affect tech stocks?", 
                    "Compare Apple and Microsoft's performance this quarter", 
                    "Explain the impact of Fed announcements on banking stocks", 
                    "What regions are affected by semiconductor shortages?", 
                    "Show me historical patterns of market reactions to similar events"].map(question => (
                    <Button 
                      key={question} 
                      variant="outline" 
                      className="h-auto justify-start border-gray-700 py-3 text-left text-xs hover:bg-gray-800 md:text-sm" 
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => <ChatMessage key={index} message={message} />)
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
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-1 top-1 h-8 w-8 rounded-md" 
                  disabled={loading || !inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && (
                <SuggestedQuestions questions={suggestedQuestions} onSelectQuestion={handleSuggestedQuestion} />
              )}
            </form>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {isVisualizationOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute bottom-[50%] right-[calc(50%-1px)] z-10 hidden h-12 w-6 translate-y-1/2 rounded-none rounded-l-full border-l border-y border-white/10 bg-gray-800/50 hover:bg-gray-700/50 md:flex" 
            onClick={togglePanel}
          >
            {isPanelExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}

        {/* Visualization Panel */}
        {isVisualizationOpen && (
          <div className={`h-full transition-all duration-300 ${isPanelExpanded ? "w-full" : "w-1/2"}`}>
            <VisualizationPanel
              activeVisualization={activeVisualization}
              isExpanded={isPanelExpanded}
              onToggleExpand={togglePanel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatResearch;
