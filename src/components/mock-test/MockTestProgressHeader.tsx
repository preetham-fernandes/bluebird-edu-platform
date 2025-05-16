// src/components/mock-test/MockTestProgressHeader.tsx
"use client";

import { Progress } from "@/components/ui/progress";

interface MockTestProgressHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export default function MockTestProgressHeader({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
}: MockTestProgressHeaderProps) {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Question {currentQuestion} of {totalQuestions}</span>
        </div>
        
        <div>
          <span className="text-sm text-muted-foreground">
            {answeredQuestions} of {totalQuestions} questions answered
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
}