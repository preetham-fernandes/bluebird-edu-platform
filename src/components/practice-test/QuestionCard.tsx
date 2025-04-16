// src/components/practice-test/QuestionCard.tsx
"use client";

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { TestQuestion } from '@/lib/types/test';

interface QuestionCardProps {
  question: TestQuestion;
  onAnswer: (questionId: number, answer: string, isCorrect: boolean) => void;
  showExplanation?: boolean;
}

export default function QuestionCard({ 
  question, 
  onAnswer,
  showExplanation = false
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  
  const handleOptionChange = (value: string) => {
    if (answered) return;
    
    // Auto-submit the answer
    setSelectedOption(value);
    const isCorrect = value === question.correctAnswer;
    setAnswered(true);
    onAnswer(question.id, value, isCorrect);
  };
  
  return (
    <Card className="w-full mb-4 relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="text-6xl font-bold rotate-12">BLUEBIRD</span>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-lg font-semibold mr-2">
            Question {question.questionNumber}
          </span>
          {answered && (
            selectedOption === question.correctAnswer ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )
          )}
        </CardTitle>
        <CardDescription className="text-base font-medium text-foreground">
          {question.questionText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedOption || ""} 
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div 
              key={option.id} 
              onClick={() => !answered && handleOptionChange(option.label)}
              className={cn(
                "flex items-start space-x-2 rounded-md border p-3 transition-colors cursor-pointer",
                answered && option.label === question.correctAnswer 
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                  : answered && option.label === selectedOption 
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                    : "hover:bg-accent"
              )}
            >
              <RadioGroupItem 
                value={option.label} 
                id={`question-${question.id}-option-${option.label}`} 
                disabled={answered}
                className="mt-1"
              />
              <Label 
                htmlFor={`question-${question.id}-option-${option.label}`}
                className={cn(
                  "flex-1 font-normal",
                  answered && option.label === question.correctAnswer 
                    ? "text-green-700 dark:text-green-300" 
                    : answered && option.label === selectedOption 
                      ? "text-red-700 dark:text-red-300" 
                      : ""
                )}
              >
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{option.label}:</span>
                  <span>{option.text}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      
      {(answered || showExplanation) && question.explanation && (
        <CardContent className="pt-0">
          <div className="rounded-md bg-muted p-4 mt-2">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Explanation</h4>
                <p className="text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
      
      {answered && (
        <CardFooter className="pt-2">
          <div className="ml-auto text-sm font-medium">
            {selectedOption === question.correctAnswer ? (
              <span className="text-green-600 dark:text-green-400">Correct!</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                Incorrect. The correct answer is {question.correctAnswer}.
              </span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}