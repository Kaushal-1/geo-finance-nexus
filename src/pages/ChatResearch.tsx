
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Send, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import ApiKeyInput from "@/components/chat/ApiKeyInput";
import VisualizationPanel from "@/components/chat/VisualizationPanel";
import { useChatState } from "@/hooks/useChatState";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ChatResearch: React.FC = () => {
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('finnhubApiKey') || "");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(!!apiKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [visualizationType, setVisualizationType] = useState<string | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [input, setInput] = useState("");
  
  const {
    messages,
    loading,
    activeVisualization,
    suggestedQuestions,
    sendMessage
  } = useChatState();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const storedKey = localStorage.getItem('finnhubApiKey');
    setApiKey(storedKey);
    setIsApiKeyValid(!!storedKey);
  }, []);

  const handleApiKeySubmit = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('finnhubApiKey', newKey);
    setIsApiKeyValid(true);
    setIsApiKeyModalOpen(false);
    toast({
      title: "API Key Updated",
      description: "Your Finnhub API key has been successfully updated.",
    });
  };

  const handleSend = async () => {
    if (!apiKey || apiKey.trim() === "") {
      toast({
        title: "API Key Required",
        description: "Please enter your Finnhub API key to continue.",
        variant: "destructive",
      });
      setIsApiKeyModalOpen(true);
      return;
    }

    if (!isApiKeyValid) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid Finnhub API key.",
        variant: "destructive",
      });
      setIsApiKeyModalOpen(true);
      return;
    }

    if (input.trim() === "") return;

    setIsLoading(true);
    setError(null);
    setShowVisualization(false);

    try {
      // Add the user message directly to the UI for immediate feedback
      const response = await sendMessage(input);
      
      // Reset input after sending
      setInput("");

      // Check if we should display visualization
      if (response?.visualization) {
        setVisualizationData(response.visualization);
        setVisualizationType(response.visualization.type);
        setShowVisualization(true);
      } else {
        setShowVisualization(false);
      }
    } catch (e: any) {
      console.error("Error sending message:", e);
      setError(e.message || "An unexpected error occurred.");
      toast({
        title: "Error",
        description: `Failed to generate response: ${e.message || "An unexpected error occurred."}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0e17]">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold text-white mb-4">AI Research Assistant</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col h-[calc(100vh - 250px)]">
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && <div className="p-3 bg-gray-800/60 rounded-xl text-gray-300 max-w-[85%] mb-4">Thinking...</div>}
          </div>

          {showVisualization && visualizationData && (
            <ErrorBoundary>
              <VisualizationPanel 
                visualization={visualizationData}
              />
            </ErrorBoundary>
          )}
        </div>

        <Separator className="my-4 bg-gray-700" />

        {suggestedQuestions && suggestedQuestions.length > 0 && (
          <SuggestedQuestions 
            questions={suggestedQuestions}
            onSelectQuestion={handleSuggestionClick}
          />
        )}

        <div className="flex items-center mt-4">
          <Input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow mr-2 bg-gray-800 text-white border-gray-700"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={isLoading || loading}>
            Send
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatResearch;
