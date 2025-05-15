
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useChatState } from '@/hooks/useChatState';
import { ChatMessage as ChatMessageType } from '@/types/chat'; 
import SuggestedQuestions from '@/components/chat/SuggestedQuestions';
import ChatMessage from '@/components/chat/ChatMessage';
import VisualizationPanel from '@/components/chat/VisualizationPanel';
import ApiKeyInput from '@/components/chat/ApiKeyInput';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { usePortfolioContext } from '@/hooks/usePortfolioContext';

const ChatResearch = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { portfolioSummary } = usePortfolioContext(); // Using portfolioSummary instead of portfolioContext
  
  const { 
    messages, 
    loading, 
    activeVisualization, 
    suggestedQuestions, 
    sendMessage,
    setActiveVisualization,
    clearChat
  } = useChatState();
  
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      // Create welcome message
      sendMessage("👋 Welcome to the AI Financial Research Assistant! I can help you analyze stocks, understand market trends, and provide insights on economic data. What would you like to know today?");
      
      // Set initial suggested questions
      const initialQuestions = [
        "How is the technology sector performing this month?",
        "What's the outlook for inflation in 2025?",
        "Analyze the recent performance of AAPL stock",
        "What are the top-performing ETFs for sustainable investing?"
      ];
      
      // Direct update is not needed as the sendMessage function will handle this
    }
  }, [messages.length, sendMessage]);
  
  const handleSendMessage = async () => {
    if (input.trim() && !loading) {
      await sendMessage(input, portfolioSummary);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleQuestionClick = (question: string) => {
    setInput(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#131b2e] flex flex-col">
      {/* Add Dashboard Header */}
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden px-4 py-6">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-white">Financial Research Assistant</h1>
          
          <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
            {/* Messages Panel */}
            <Card className="flex-1 bg-[#0f1628]/80 backdrop-blur-sm border border-white/5 overflow-hidden flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                    />
                  ))}
                  {loading && (
                    <div className="flex items-center space-x-2 text-gray-400 animate-pulse">
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
                
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about market trends, stock analysis, or economic data..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      ref={inputRef}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {suggestedQuestions.length > 0 && (
                    <SuggestedQuestions 
                      questions={suggestedQuestions} 
                      onSelectQuestion={handleQuestionClick} 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Visualization Panel */}
            {activeVisualization && (
              <div className="md:w-1/2 h-full overflow-hidden">
                <VisualizationPanel 
                  onClose={() => setActiveVisualization(null)}
                  title={activeVisualization.title}
                  chartType={activeVisualization.type}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatResearch;
