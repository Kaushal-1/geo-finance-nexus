
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPerplexityApiKey, setPerplexityApiKey } from "@/services/chatService";
import { Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved key on component mount
    const savedKey = getPerplexityApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setPerplexityApiKey(apiKey.trim());
    setIsSaved(true);
    
    toast({
      title: "Success",
      description: "API key saved successfully",
      variant: "default",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="api-key" className="text-sm font-medium">
            Perplexity API Key
          </label>
          {isSaved && (
            <span className="flex items-center text-xs text-green-400">
              <Check className="mr-1 h-3 w-3" />
              Saved
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your Perplexity API key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setIsSaved(false);
            }}
            className="flex-1 bg-gray-900"
          />
          <Button onClick={handleSave} disabled={isSaved}>
            Save
          </Button>
        </div>
        
        <p className="text-xs text-gray-400">
          Your API key is stored locally in your browser and never sent to our servers.
          <a 
            href="https://docs.perplexity.ai/docs/getting-started" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1 text-blue-400 hover:underline"
          >
            Get a key
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;
