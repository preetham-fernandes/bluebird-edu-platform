// src/components/mock-test/MockTestQuestionCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { TestQuestion } from '@/types/test';

interface MockTestQuestionCardProps {
  question: TestQuestion;
  selectedAnswer: string;
  onAnswer: (questionId: number, answer: string) => void;
}

export default function MockTestQuestionCard({ 
  question, 
  selectedAnswer,
  onAnswer
}: MockTestQuestionCardProps) {
  const handleOptionChange = (value: string) => {
    onAnswer(question.id, value);
  };
  
  return (
    <Card className="w-full mb-4 relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="text-6xl font-bold rotate-12">BLUEBIRD</span>
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-4">
            Question {question.questionNumber}
          </h2>
          <p className="text-base">
            {question.questionText}
          </p>
        </div>
        
        <RadioGroup 
          value={selectedAnswer} 
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div 
              key={option.id} 
              className={cn(
                "flex items-start space-x-2 rounded-md border p-3 transition-colors cursor-pointer",
                selectedAnswer === option.label 
                  ? "border-primary bg-primary/5" 
                  : "hover:bg-accent"
              )}
              onClick={() => handleOptionChange(option.label)}
            >
              <RadioGroupItem 
                value={option.label} 
                id={`question-${question.id}-option-${option.label}`} 
                className="mt-1"
              />
              <Label 
                htmlFor={`question-${question.id}-option-${option.label}`}
                className="flex-1 font-normal cursor-pointer"
              >
                <div className="flex items-start">
                  <span className="font-semibold mr-2">{option.label}:</span>
                  <span>{option.text}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}