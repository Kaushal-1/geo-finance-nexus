
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

  const sendMessage = useCallback(async (content: string, portfolioContext: any = null) => {
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
        
        // Determine visualization type based on query
        let visualizationType: 'bar' | 'line' | 'pie' | 'map' = 'bar';
        
        if (content.toLowerCase().includes('trend') || 
            content.toLowerCase().includes('over time') || 
            content.toLowerCase().includes('history')) {
          visualizationType = 'line';
        } else if (content.toLowerCase().includes('distribution') || 
                  content.toLowerCase().includes('allocation') || 
                  content.toLowerCase().includes('breakdown')) {
          visualizationType = 'pie';
        } else if (content.toLowerCase().includes('map') || 
                  content.toLowerCase().includes('region') || 
                  content.toLowerCase().includes('country') || 
                  content.toLowerCase().includes('global')) {
          visualizationType = 'map';
        }
        
        const loadingVisualization: Visualization = {
          id: generateId(),
          title: 'Generating visualization...',
          loading: true,
          type: visualizationType
        };
        
        setActiveVisualization(loadingVisualization);
      }

      // Generate AI response with portfolio context
      const { message: aiMessage, visualization, suggestedQuestions: newSuggestions } = 
        await generateResponse(content, messages, portfolioContext);

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

      // Update suggested questions - limit to 4 random ones
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
      // Only 2 initial suggested questions
      setSuggestedQuestions([
        "How will rising interest rates affect tech stocks?",
        "Compare Apple and Microsoft's performance this quarter"
      ]);
    }
  }, [messages]);

  // Function to clear chat history and reset state
  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveVisualization(null);
    // Reset suggested questions to initial state - only 2
    setSuggestedQuestions([
      "How will rising interest rates affect tech stocks?",
      "Compare Apple and Microsoft's performance this quarter"
    ]);
  }, []);

  return {
    messages,
    loading,
    activeVisualization,
    suggestedQuestions,
    sendMessage,
    setActiveVisualization,
    clearChat,
  };
}
