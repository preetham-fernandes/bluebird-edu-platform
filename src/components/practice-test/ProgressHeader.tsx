// src/components/practice-test/ProgressHeader.tsx
"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProgressHeaderProps {
  currentPage: number;
  totalPages: number;
  answeredQuestions: number;
  totalQuestions: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  canGoNext: boolean;
  canSubmit?: boolean;
  onSubmitTest?: () => void;
}

export default function ProgressHeader({
  currentPage,
  totalPages,
  answeredQuestions,
  totalQuestions,
  onPreviousPage,
  onNextPage,
  canGoNext,
  canSubmit = false,
  onSubmitTest
}: ProgressHeaderProps) {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-md font-medium">
            Page {currentPage} of {totalPages}
          </h3>
          <span className="text-sm text-muted-foreground">
            {answeredQuestions} of {totalQuestions} questions answered
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {canSubmit && onSubmitTest ? (
            <Button
              size="sm"
              onClick={onSubmitTest}
              disabled={answeredQuestions < totalQuestions}
            >
              Submit Test
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!canGoNext || currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
}