"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QuestionCard from '@/components/practice-test/QuestionCard';
import ProgressHeader from '@/components/practice-test/ProgressHeader';
import TestResults from '@/components/practice-test/TestResults';
import { Test, QuestionResponse } from '@/types/test';

// Number of questions per page
const QUESTIONS_PER_PAGE = 5;

// Mock userId for demonstration (in production, get from auth context)
const DEMO_USER_ID = 1;

export default function PracticeTestPage() {
  const params = useParams();
  const { aircraft, test } = params;
  
  // State for test data and UI
  const [testData, setTestData] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  
  // Function to format URL parameters
  const formatParam = (param: string | string[]) => 
    Array.isArray(param) ? param[0] : param;
  
  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        
        // Convert test slug to a numeric ID (in a real app, you might look up by slug)
        // For now, we'll assume the test param is the numeric ID
        const testId = formatParam(test);
        
        const response = await fetch(`/api/practice-tests/${testId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test data');
        }
        
        const data = await response.json();
        setTestData(data);
      } catch (err) {
        console.error('Error fetching test:', err);
        setError('Failed to load test. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (test) {
      fetchTest();
    }
  }, [test]);
  
  // Scroll to top when page changes
  useEffect(() => {
    if (testData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, testData]);
  
  // Calculate derived values
  const totalPages = useMemo(() => {
    if (!testData) return 1;
    return Math.ceil(testData.questions.length / QUESTIONS_PER_PAGE);
  }, [testData]);
  
  const currentQuestions = useMemo(() => {
    if (!testData) return [];
    
    const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIdx = startIdx + QUESTIONS_PER_PAGE;
    
    return testData.questions.slice(startIdx, endIdx);
  }, [testData, currentPage]);
  
  const answeredQuestions = useMemo(() => {
    return responses.length;
  }, [responses]);
  
  const pageAnsweredQuestions = useMemo(() => {
    return currentQuestions.filter(q => 
      responses.some(r => r.questionId === q.id)
    ).length;
  }, [currentQuestions, responses]);
  
  // Handle answer selection
  const handleAnswer = (questionId: number, answer: string, isCorrect: boolean) => {
    setResponses(prev => {
      // Check if this question was already answered
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      
      if (existingIndex >= 0) {
        // Update existing response
        const newResponses = [...prev];
        newResponses[existingIndex] = {
          questionId,
          userAnswer: answer,
          isCorrect,
          sequenceNumber: newResponses[existingIndex].sequenceNumber
        };
        return newResponses;
      } else {
        // Add new response
        return [...prev, {
          questionId,
          userAnswer: answer,
          isCorrect,
          sequenceNumber: testData?.questions.findIndex(q => q.id === questionId) || 0
        }];
      }
    });
  };
  
  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Handle test submission
  const handleSubmitTest = async () => {
    if (!testData) return;
    
    try {
      // Calculate score
      const correctCount = responses.filter(r => r.isCorrect).length;
      const calculatedScore = (correctCount / testData.questions.length) * 100;
      setTestScore(calculatedScore);
      
      // Submit test attempt to the server
      const response = await fetch('/api/test-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          testId: testData.id,
          responses,
          score: calculatedScore,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit test attempt');
      }
      
      // Mark test as submitted
      setTestSubmitted(true);
    } catch (err) {
      console.error('Error submitting test:', err);
      // Even if submission fails, we can still show results to the user
      setTestSubmitted(true);
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    setResponses([]);
    setCurrentPage(1);
    setTestSubmitted(false);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // If test not found
  if (!testData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Test Not Found</AlertTitle>
        <AlertDescription>
          The practice test you&apos;re looking for doesn&apos;t exist. Please go back and select a different test.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Results page after test submission
  if (testSubmitted) {
    return (
      <TestResults
        testId={testData.id}
        aircraftSlug={formatParam(aircraft)}
        testTitle={testData.title}
        subject={testData.subject}
        questions={testData.questions}
        responses={responses}
        score={testScore}
        onRetry={handleRetry}
      />
    );
  }
  
  
  // Main test view
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {testData.title}
        </h1>
        <p className="text-muted-foreground">
          {testData.subject} - {testData.aircraft}
        </p>
      </div>
      
      <div className="space-y-4">
        {currentQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
          />
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-[5]">
        <ProgressHeader
          currentPage={currentPage}
          totalPages={totalPages}
          answeredQuestions={answeredQuestions}
          totalQuestions={testData.questions.length}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          canGoNext={pageAnsweredQuestions === currentQuestions.length}
          canSubmit={answeredQuestions === testData.questions.length && currentPage === totalPages}
          onSubmitTest={handleSubmitTest}
        />
      </div>
    </div>
  );
}