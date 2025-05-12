
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, Visualization } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { generateResponse } from '@/services/chatService';

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState<Visualization | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const { toast } = useToast();

  // Helper to generate a unique ID
  const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const sendMessage = useCallback(async (content: string) => {
    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        sender: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);
      setLoading(true);

      // Create loading visualization if needed
      if (content.toLowerCase().includes('show') || 
          content.toLowerCase().includes('chart') || 
          content.toLowerCase().includes('map') ||
          content.toLowerCase().includes('compare') ||
          content.toLowerCase().includes('visualization')) {
        
        const loadingVisualization: Visualization = {
          id: generateId(),
          title: 'Generating visualization...',
          loading: true,
        };
        
        setActiveVisualization(loadingVisualization);
      }

      // Generate AI response
      const { message: aiMessage, visualization, suggestedQuestions: newSuggestions } = 
        await generateResponse(content, messages);

      // Update state with AI response
      setMessages(prevMessages => [...prevMessages, {
        ...aiMessage,
        id: generateId(),
        timestamp: new Date(),
      }]);

      // Update visualization if available
      if (visualization) {
        setActiveVisualization({
          ...visualization,
          id: generateId(),
          loading: false,
        });
      } else if (activeVisualization?.loading) {
        setActiveVisualization(null);
      }

      // Update suggested questions
      setSuggestedQuestions(newSuggestions);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });

      // Reset loading visualization
      if (activeVisualization?.loading) {
        setActiveVisualization(null);
      }
    } finally {
      setLoading(false);
    }
  }, [messages, activeVisualization, toast]);

  // Load suggested questions on initial load
  useEffect(() => {
    if (messages.length === 0) {
      setSuggestedQuestions([
        "How will rising interest rates affect tech stocks?",
        "Compare Apple and Microsoft's performance this quarter",
        "Explain the impact of Fed announcements on banking stocks",
        "What regions are affected by semiconductor shortages?"
      ]);
    }
  }, [messages]);

  return {
    messages,
    loading,
    activeVisualization,
    suggestedQuestions,
    sendMessage,
    setActiveVisualization,
  };
}
