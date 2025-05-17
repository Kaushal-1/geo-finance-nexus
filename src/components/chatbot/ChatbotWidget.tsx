import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPerplexityApiKey } from "@/services/chatService";
import { toast } from "@/components/ui/use-toast";
import ChatMessage from "./ChatMessage";
import SuggestionChips from "./SuggestionChips";
import { cn } from "@/lib/utils";
import "./chatbot.css";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    content: "👋 Welcome to GeoFinance Assistant! How can I help you today?",
    role: "assistant",
    timestamp: new Date(),
  },
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Hide suggestions after first message
    if (showSuggestions) {
      setShowSuggestions(false);
    }

    try {
      const apiKey = getPerplexityApiKey();
      
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "Please set your Perplexity API key in the settings.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call the Perplexity Sonar API
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are GeoFinance Assistant, an AI that helps with financial analysis, stock information, and market insights. Keep your responses focused on financial topics, concise (under 150 words), and helpful. Current date: May 2025."
            },
            {
              role: "user",
              content: input.trim()
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: assistantResponse,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Sonar API:", error);
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setShowSuggestions(true);
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <motion.button
        className="bg-gradient-to-r from-teal to-teal-dark text-white p-3.5 rounded-full shadow-lg hover:shadow-teal/30 transition-shadow duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleWidget}
        aria-label="Open chat assistant"
      >
        <MessageCircle size={24} />
      </motion.button>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[350px] max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#131b2e] to-[#0a0e17] p-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="bg-teal p-1 rounded-md">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <h3 className="text-white font-semibold">GeoFinance Assistant</h3>
                <span className="text-xs text-gray-400">(Sonar API)</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={clearChat}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Clear chat"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex flex-col h-[350px]">
              <ScrollArea className="flex-1 p-3">
                <div className="flex flex-col gap-3">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-center py-2">
                      <span className="text-teal text-sm animate-pulse">Getting insights...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Suggestions */}
              <AnimatePresence>
                {showSuggestions && messages.length === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-2 overflow-hidden"
                  >
                    <SuggestionChips onSuggestionClick={handleSuggestionClick} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Input Box */}
              <div className={cn(
                "border-t border-white/10 p-2 transition-colors",
                isLoading && "bg-gray-900/50"
              )}>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about any stock, market or news..."
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "bg-teal hover:bg-teal-dark",
                      (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed"
                    )}
                    size="icon"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;
