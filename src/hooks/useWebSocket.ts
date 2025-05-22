
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

interface WebSocketOptions {
  symbols: string[];
  onMessage: (data: any) => void;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef<WebSocketOptions | null>(null);

  // Clean up function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback((options: WebSocketOptions) => {
    // Store options for reconnection
    optionsRef.current = options;
    
    // Check if we're already connected to the same symbols
    if (wsRef.current && isConnected) {
      console.log("WebSocket already connected, disconnecting first");
      cleanup();
    }
    
    setIsConnecting(true);
    
    try {
      // Connect to test API for development/demo purposes
      // For production, use: "wss://stream.data.alpaca.markets/v2/iex"
      const ws = new WebSocket("wss://stream.data.alpaca.markets/v2/test");
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("WebSocket connected");
        
        // Authenticate
        ws.send(JSON.stringify({
          action: "auth",
          key: "PKJ1BKJG3HHOXYNCRLZK",
          secret: "l9KdVbejeABLTE8Z6JxcLRQwHebECBnWpiqqPhhd"
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle authentication response
        if (Array.isArray(data)) {
          if (data[0] && data[0].msg === 'authenticated') {
            console.log("WebSocket authenticated");
            setIsConnected(true);
            setIsConnecting(false);
            
            // Subscribe to the symbols
            const subscribeMsg = {
              action: "subscribe",
              quotes: options.symbols,
              trades: options.symbols
            };
            
            ws.send(JSON.stringify(subscribeMsg));
            console.log(`Subscribed to ${options.symbols.join(', ')}`);
          } else if (data[0] && data[0].msg === 'authentication failed') {
            console.error("WebSocket authentication failed");
            toast({
              title: "Connection Failed",
              description: "WebSocket authentication failed",
              variant: "destructive"
            });
            cleanup();
          }
        } else if (isConnected) {
          // Process incoming data
          options.onMessage(data);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "WebSocket Error",
          description: "Connection error occurred",
          variant: "destructive"
        });
        cleanup();
        
        // Try to reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (optionsRef.current) {
            console.log("Attempting to reconnect WebSocket...");
            connectWebSocket(optionsRef.current);
          }
        }, 5000);
      };
      
      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setIsConnecting(false);
        
        // Only try to reconnect if it wasn't manually closed
        if (wsRef.current !== null && optionsRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect WebSocket...");
            connectWebSocket(optionsRef.current);
          }, 5000);
        }
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: "Could not establish WebSocket connection",
        variant: "destructive"
      });
    }
  }, [cleanup, isConnected]);

  // Disconnect from WebSocket
  const disconnectWebSocket = useCallback(() => {
    console.log("Manually disconnecting WebSocket");
    cleanup();
    optionsRef.current = null;
  }, [cleanup]);

  // Clean up on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isConnected,
    isConnecting,
    connectWebSocket,
    disconnectWebSocket
  };
}
