
import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "./ChatbotWidget";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-2 max-w-[95%]",
        isAssistant ? "self-start" : "self-end ml-auto"
      )}
    >
      {isAssistant && (
        <div className="bg-teal p-1 h-6 w-6 rounded-md flex items-center justify-center mt-1">
          <MessageCircle size={14} className="text-white" />
        </div>
      )}
      
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm",
          isAssistant 
            ? "bg-[#1a2035]/80 text-white" 
            : "bg-teal-gradient text-white"
        )}
      >
        {message.content}
      </div>
      
      {!isAssistant && (
        <div className="bg-gray-700 p-1 h-6 w-6 rounded-md flex items-center justify-center mt-1">
          <User size={14} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
