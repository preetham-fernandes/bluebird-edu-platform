// src/components/mock-test/MockTestResults.tsx
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
  ChevronDown, 
  ChevronUp, 
  Home, 
  Clock,
  Award,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TestQuestion } from '@/types/test';
import { cn } from '@/lib/utils';

interface MockTestResultsProps {
  testId: number;
  aircraftSlug: string;
  testTitle: string;
  subject: string;
  questions: TestQuestion[];
  responses: Record<number, string>;
  score: number;
  timeTaken: number | null;
  timeExpired: boolean;
  onBackToTests: () => void;
}

export default function MockTestResults({
  aircraftSlug,
  testTitle,
  subject,
  questions,
  responses,
  score,
  timeTaken,
  timeExpired,
  onBackToTests
}: MockTestResultsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  
  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };
  
  // Format time taken for display
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "N/A";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const correctCount = questions.filter(q => responses[q.id] === q.correctAnswer).length;
  const passStatus = score >= 70;
  
  return (
    <div className="space-y-8">
      {timeExpired && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <div>
              <h3 className="font-semibold">Time Expired</h3>
              <p className="text-sm">Your test was automatically submitted because the time limit was reached.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-2 border-muted">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{subject}</CardTitle>
          <CardDescription className="text-base">
          Mock Test Results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-4",
              passStatus ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
            )}>
              {passStatus ? (
                <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {score.toFixed(1)}%
            </h3>
            <p className={cn(
              "text-sm font-medium",
              passStatus ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {passStatus ? "Passed" : "Failed"} - {correctCount} of {questions.length} correct
            </p>
          </div>
          
          <div className="gap-4 items-center justify-center">
            <div className="flex items-center gap-3 text-lg justify-center">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-primary">Time Taken:</span>
              <span className="font-mono">{formatTime(timeTaken)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={onBackToTests}>
            <Home className="mr-2 h-4 w-4" />
            Back to Tests
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Question Review</h3>
        
        {questions.map((question) => {
          const userAnswer = responses[question.id] || 'Not answered';
          const isCorrect = userAnswer === question.correctAnswer;
          const isExpanded = expandedQuestions.includes(question.id);
          
          return (
            <Card 
              key={question.id} 
              className={cn(
                "border-l-4 cursor-pointer",
                isCorrect 
                  ? "border-l-green-500" 
                  : "border-l-red-500"
              )}
              onClick={() => toggleQuestion(question.id)}
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <span className="font-medium mr-2">Q{question.questionNumber}:</span>
                    <span className="font-normal text-sm md:text-base">
                      {question.questionText}
                    </span>
                  </CardTitle>
                  <span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pb-3 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className={cn(
                        "rounded-full p-1.5 mr-2 mt-0.5",
                        isCorrect 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-red-100 dark:bg-red-900/30"
                      )}>
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isCorrect 
                            ? "Your answer was correct" 
                            : "Your answer was incorrect"}
                        </p>
                        <div className="text-sm mt-1">
                          <span className="text-muted-foreground">Your answer:</span>{' '}
                          <span className={isCorrect 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                          }>
                            {userAnswer}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Correct answer:</span>{' '}
                            <span className="text-green-600 dark:text-green-400">
                              {question.correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {question.explanation && (
                      <div className="rounded-md bg-muted p-3 mt-2">
                        <h4 className="text-sm font-medium mb-1">Explanation</h4>
                        <p className="text-xs text-muted-foreground">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}