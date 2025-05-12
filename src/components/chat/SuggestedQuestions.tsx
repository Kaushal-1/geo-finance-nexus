
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2 pb-1">
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="h-auto border-gray-700 bg-gray-800/70 py-1 text-xs hover:bg-gray-700"
          onClick={() => onSelectQuestion(question)}
          disabled={disabled}
        >
          <MessageCircle className="mr-1 h-3 w-3" />
          {question}
        </Button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;
