
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPerplexityApiKey } from "@/services/chatService";
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
    toast({
      title: "Information",
      description: "API key is now loaded from environment variables. No need to manually enter it.",
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
              Loaded from environment
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            placeholder="API key loaded from environment variables"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 bg-gray-900"
            disabled={true}
          />
          <Button onClick={handleSave} disabled={true}>
            Saved
          </Button>
        </div>
        
        <p className="text-xs text-gray-400">
          Your API key is now loaded from environment variables for better security.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;
