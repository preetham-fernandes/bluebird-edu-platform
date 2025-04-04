// src/components/practice-test/TestResults.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
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
  RotateCcw,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TestQuestion, QuestionResponse } from '@/lib/types/test';
import { cn } from '@/lib/utils';

interface TestResultsProps {
  testId: number;
  aircraftSlug: string;
  testTitle: string;
  subject: string;
  questions: TestQuestion[];
  responses: QuestionResponse[];
  score: number;
  onRetry: () => void;
}

export default function TestResults({
  testId,
  aircraftSlug,
  testTitle,
  subject,
  questions,
  responses,
  score,
  onRetry
}: TestResultsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  
  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };
  
  const correctCount = responses.filter(r => r.isCorrect).length;
  const passStatus = score >= 70;
  
  return (
    <div className="space-y-8">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Test Results</CardTitle>
          <CardDescription className="text-base">
            {testTitle} - {subject}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Score</span>
              <span>{score.toFixed(1)}%</span>
            </div>
            <Progress 
              value={score} 
              className={cn(
                "h-2.5",
                passStatus ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
              )}
              indicatorClassName={passStatus ? "bg-green-600" : "bg-red-600"}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onRetry}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Test
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`/${aircraftSlug}/practice-test/${subject.toLowerCase()}`}>
              <Home className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Question Review</h3>
        
        {questions.map((question, index) => {
          const response = responses.find(r => r.questionId === question.id);
          const isExpanded = expandedQuestions.includes(question.id);
          
          return (
            <Card 
              key={question.id} 
              className={cn(
                "border-l-4",
                response?.isCorrect 
                  ? "border-l-green-500" 
                  : "border-l-red-500"
              )}
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <span className="font-medium mr-2">Q{question.questionNumber}:</span>
                    <span className="font-normal text-sm md:text-base">
                      {question.questionText}
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pb-3 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className={cn(
                        "rounded-full p-1.5 mr-2 mt-0.5",
                        response?.isCorrect 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-red-100 dark:bg-red-900/30"
                      )}>
                        {response?.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {response?.isCorrect 
                            ? "Your answer was correct" 
                            : "Your answer was incorrect"}
                        </p>
                        <div className="text-sm mt-1">
                          <span className="text-muted-foreground">Your answer:</span>{' '}
                          <span className={response?.isCorrect 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                          }>
                            {response?.userAnswer || 'No answer'}
                          </span>
                        </div>
                        {!response?.isCorrect && (
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