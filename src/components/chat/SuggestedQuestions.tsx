
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  onRemoveQuestion?: (index: number) => void;
  disabled?: boolean;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelectQuestion,
  onRemoveQuestion,
  disabled = false,
}) => {
  if (!questions || questions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 pb-1">
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="h-auto border-gray-700 bg-gray-800/70 py-1 text-xs hover:bg-gray-700 group relative"
          onClick={() => onSelectQuestion(question)}
          disabled={disabled}
        >
          <MessageCircle className="mr-1 h-3 w-3" />
          {question}
          {onRemoveQuestion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveQuestion(index);
              }}
              className="absolute -right-1 -top-1 rounded-full bg-gray-700 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;
