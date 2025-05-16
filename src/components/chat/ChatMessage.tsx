
import React from "react";
import { Bot, ExternalLink } from "lucide-react";
import { ChatMessage as ChatMessageType, SourceCitation } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessageContent = ({ content }: { content: string }) => {
  // Split content to find code blocks and render them differently
  const parts = content.split(/```([^`]+)```/).filter(Boolean);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // Code block
          return (
            <pre key={index} className="rounded-lg bg-gray-800 p-3 text-sm font-mono text-gray-200 overflow-auto">
              <code>{part}</code>
            </pre>
          );
        } else {
          // Regular text - split by paragraphs
          const paragraphs = part.split("\n\n");
          return paragraphs.map((paragraph, pIndex) => (
            <p key={`${index}-${pIndex}`} className="leading-relaxed">
              {paragraph}
            </p>
          ));
        }
      })}
    </div>
  );
};

const SourceCitationBlock = ({ source }: { source: SourceCitation }) => (
  <div className="mt-2 rounded-md border border-gray-700 bg-gray-800/50 p-2">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-300">{source.title}</p>
        <p className="text-xs text-gray-400">{source.publisher} • {source.date}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 text-gray-400 hover:text-white"
        asChild
      >
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === "ai";
  const content = message.content;

  return (
    <div className={`mb-6 flex ${isAI ? "flex-row" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`mt-1 flex-shrink-0 ${isAI ? "mr-4" : "ml-4"}`}>
        {isAI ? (
          <Avatar className="h-8 w-8 rounded-md bg-teal-700/30">
            <AvatarFallback className="rounded-md bg-teal-700/30 text-teal-300">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8 rounded-md bg-blue-700/30">
            <AvatarFallback className="rounded-md bg-blue-700/30 text-blue-300">U</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`relative max-w-[85%] rounded-xl p-4 ${
          isAI
            ? "bg-gray-800/60 text-gray-100"
            : "bg-blue-600/20 text-gray-100"
        }`}
      >
        {message.sentiment && (
          <div 
            className={`absolute -left-1 top-3 h-2 w-2 rounded-full ${
              message.sentiment === "positive" ? "bg-green-500" :
              message.sentiment === "negative" ? "bg-red-500" : 
              "bg-yellow-500"
            }`} 
          />
        )}

        <ChatMessageContent content={content} />

        {/* Mini Charts - If message contains charts */}
        {message.charts && message.charts.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {message.charts.map((chart, index) => (
              <div 
                key={index} 
                className="rounded border border-gray-700 bg-gray-800/50 p-2"
              >
                <img 
                  src={chart.imageUrl} 
                  alt={chart.title} 
                  className="mb-1 w-full" 
                />
                <p className="text-xs font-medium">{chart.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.sources.map((source, index) => (
              <SourceCitationBlock key={index} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
