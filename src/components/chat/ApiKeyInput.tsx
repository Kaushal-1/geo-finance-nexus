
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPerplexityApiKey, setPerplexityApiKey } from "@/services/chatService";
import { Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ApiKeyInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  apiKey: string | null;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ isOpen, onClose, onSubmit, apiKey }) => {
  const [inputKey, setInputKey] = useState(apiKey || "");
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      setInputKey(apiKey);
    }
  }, [apiKey]);

  const handleSave = () => {
    if (!inputKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    onSubmit(inputKey.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Finnhub API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="api-key" className="text-sm font-medium">
              Enter your Finnhub API key
            </label>
            
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Finnhub API key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-700"
              />
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
            
            <p className="text-xs text-gray-400">
              Your API key is stored locally in your browser and never sent to our servers.
              <a 
                href="https://finnhub.io/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:underline"
              >
                Get a key
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInput;
