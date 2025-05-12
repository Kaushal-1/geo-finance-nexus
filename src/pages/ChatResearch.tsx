
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Lightbulb, X } from "lucide-react";
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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import VisualizationPanel from "@/components/chat/VisualizationPanel";

const ChatResearch = () => {
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem("openai_api_key") || ""
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [maxLength, setMaxLength] = useState(4096);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [showRawJson, setShowRawJson] = useState(false);
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  
  // Use our custom chat hook instead of the missing ai/react package
  const {
    messages,
    loading: isLoading,
    activeVisualization: visualization,
    suggestedQuestions,
    sendMessage,
    setActiveVisualization
  } = useChatState();

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }, [apiKey]);

  const handleSettingsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSettingsOpen(false);
    toast({
      title: "Settings Saved",
      description: "Your chat settings have been updated.",
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  const handleClearChat = () => {
    // Clear chat messages - this will need to be implemented in useChatState
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.shiftKey === false) {
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

          {/* Settings Button */}
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat Panel */}
          <div className="md:col-span-2 h-[calc(85vh)]">
            <Card className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-md h-full overflow-hidden flex flex-col">
              <CardHeader className="py-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold">
                    Interactive Chat Session
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 mb-4">
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

          {/* Visualization Panel */}
          {visualization && (
            <div className="col-span-1 h-full">
              <VisualizationPanel onClose={() => setActiveVisualization(null)} />
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0a0e17] rounded-xl p-8 border border-white/10 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Chat Settings</h2>
                <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Separator className="bg-white/10 mb-4" />
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                {/* API Key Input */}
                <div>
                  <Label htmlFor="api-key" className="block text-sm font-medium">
                    OpenAI API Key
                  </Label>
                  <Input
                    type="password"
                    id="api-key"
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={apiKey || ""}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1 bg-gray-700 border-gray-600 text-white rounded-md"
                  />
                </div>

                {/* Model Selection */}
                <div>
                  <Label htmlFor="model" className="block text-sm font-medium">
                    Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white rounded-md mt-1 w-full justify-between">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0e17] border-white/10 text-white">
                      <SelectItem value="gpt-3.5-turbo">GPT 3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperature Slider */}
                <div>
                  <Label htmlFor="temperature" className="block text-sm font-medium">
                    Temperature
                  </Label>
                  <Slider
                    id="temperature"
                    defaultValue={[temperature]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setTemperature(value[0])}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Lower values are more predictable; higher values are more
                    random.
                  </p>
                </div>

                {/* Top P Slider */}
                <div>
                  <Label htmlFor="top-p" className="block text-sm font-medium">
                    Top P
                  </Label>
                  <Slider
                    id="top-p"
                    defaultValue={[topP]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setTopP(value[0])}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Like temperature, but chooses from the most probable tokens.
                  </p>
                </div>

                {/* Submit and Clear Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={handleClearChat}>
                    Clear Chat
                  </Button>
                  <Button type="submit">Save Settings</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatResearch;
