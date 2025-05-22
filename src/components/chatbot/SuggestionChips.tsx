
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, BarChart, Globe, User, Bell } from "lucide-react";

const SUGGESTION_CATEGORIES = [
  {
    id: "stocks",
    title: "Real-time Stock Insights",
    icon: TrendingUp,
    color: "from-blue-500 to-teal",
    suggestions: [
      "Tell me about AAPL stock today",
      "Latest news on Tesla?",
      "What's the RSI on Microsoft?",
    ]
  },
  {
    id: "sentiment",
    title: "Market Sentiment Snapshots",
    icon: BarChart,
    color: "from-purple-500 to-violet-600",
    suggestions: [
      "Is Amazon stock bullish or bearish right now?",
      "Give me a sentiment score on Nvidia",
    ]
  },
  {
    id: "news",
    title: "Global/Economic News",
    icon: Globe,
    color: "from-orange-500 to-red-500",
    suggestions: [
      "Latest US economic events?",
      "What's happening in Europe markets?",
    ]
  },
  {
    id: "portfolio",
    title: "Portfolio Queries",
    icon: User,
    color: "from-teal to-green-500",
    suggestions: [
      "What's my current portfolio PnL?",
      "How are my top 3 stocks doing?",
    ]
  },
  {
    id: "alerts",
    title: "Set Alerts/Reminders",
    icon: Bell,
    color: "from-amber-500 to-yellow-400",
    suggestions: [
      "Set alert for TSLA crossing $1000",
      "Remind me about Nvidia earnings next week",
    ]
  }
];

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSuggestionClick }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const currentCategory = SUGGESTION_CATEGORIES[currentCategoryIndex];

  const cycleCategory = () => {
    setCurrentCategoryIndex((prev) => 
      (prev + 1) % SUGGESTION_CATEGORIES.length
    );
  };

  return (
    <div className="space-y-2">
      <motion.button
        onClick={cycleCategory}
        className="flex items-center gap-2 bg-[#1a2035]/80 rounded-md px-2 py-1 w-full text-sm text-white hover:bg-[#1a2035] transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`bg-gradient-to-r ${currentCategory.color} p-1 rounded-md`}>
          <currentCategory.icon size={12} className="text-white" />
        </div>
        <span className="font-medium">{currentCategory.title}</span>
        <ArrowRight size={12} className="text-gray-400 ml-auto" />
      </motion.button>
      
      <div className="flex flex-wrap gap-1">
        {currentCategory.suggestions.map((suggestion, index) => (
          <motion.button
            key={`${currentCategory.id}-${index}`}
            className="bg-white/5 hover:bg-white/10 text-xs text-white py-1 px-2 rounded-md border border-white/10 transition-colors"
            onClick={() => onSuggestionClick(suggestion)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;
