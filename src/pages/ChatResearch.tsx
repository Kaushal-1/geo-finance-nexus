import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lightbulb, Send, X } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { useChatState } from "@/hooks/useChatState";
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

  const {
    messages,
    loading: isLoading,
    activeVisualization: visualization,
    suggestedQuestions,
    sendMessage,
    setActiveVisualization,
    clearChat,
  } = useChatState();

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }, [apiKey]);

  const formatApiResponse = (response: string): string => {
    // Remove markdown syntax: ###, ##, **, *, etc.
    let formatted = response
      .replace(/#+\s?/g, '')          // Remove headers like ###, ##
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold syntax
      .replace(/\*(.*?)\*/g, '$1');    // Italic or bullet symbols
  
    // Capitalize the first letter of each sentence
    formatted = formatted.replace(/(?:^|[.!?]\s+)([a-z])/g, (match, p1) => p1.toUpperCase());
  
    return formatted;
  };
  

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputText.trim()) {
      const formattedText = formatApiResponse(inputText);
      sendMessage(formattedText);
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
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
        </div>

        {/* Main Layout */}
        <div className="flex flex-col h-screen">
          <Card className="flex flex-col flex-1 border border-white/10 rounded-xl bg-black/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="py-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Interactive Chat Session</h2>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              <ScrollArea className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-teal-600 text-white ml-auto w-fit max-w-[80%]"
                          : "bg-gray-800 text-gray-100 mr-auto w-fit max-w-[80%]"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="p-3 rounded-lg bg-gray-800 text-gray-100 mr-auto w-fit max-w-[80%]">
                      Thinking...
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Ask me anything..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-gray-700 border-gray-600 text-white rounded-md resize-none"
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : <Send className="h-4 w-4" />}
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
