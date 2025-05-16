// src/app/(dashboard)/[aircraft]/mock-test/[title]/[test]/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Test } from '@/lib/types/test';
import MockTestQuestionCard from '@/components/mock-test/MockTestQuestionCard';
import MockTestProgressHeader from '@/components/mock-test/MockTestProgressHeader';
import MockTestResults from '@/components/mock-test/MockTestResults';

// Demo user ID for testing (in production, get from auth context)
const DEMO_USER_ID = 1;

export default function MockTestPage() {
  const params = useParams();
  const router = useRouter();
  const { aircraft, test } = params;
  
  // State for test data and UI
  const [testData, setTestData] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  
  // Function to format URL parameters
  const formatParam = (param: string | string[]) => 
    Array.isArray(param) ? param[0] : param;
  
  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        
        // Convert test slug to a numeric ID
        const testId = formatParam(test);
        
        const response = await fetch(`/api/mock-tests/${testId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test data');
        }
        
        const data = await response.json();
        setTestData(data);
        
        // Initialize timer if test has a time limit
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
        }
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
  
  // Timer logic
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !testSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            // Time's up
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeExpired(true);
            handleSubmitTest(); // Auto-submit when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, testSubmitted]);
  
  // Format time remaining for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle answer selection
  const handleAnswer = (questionId: number, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  // Navigation functions
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const goToNextQuestion = () => {
    if (testData && currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  // Handle test submission
  const handleSubmitTest = async () => {
    if (!testData) return;
    
    try {
      // Calculate number of correct answers
      const correctAnswers = testData.questions.filter(q => {
        const userAnswer = responses[q.id];
        return userAnswer === q.correctAnswer;
      }).length;
      
      // Calculate score
      const calculatedScore = (correctAnswers / testData.questions.length) * 100;
      setTestScore(calculatedScore);
      
      // Format responses for API
      const formattedResponses = testData.questions.map((q, index) => ({
        questionId: q.id,
        userAnswer: responses[q.id] || '',
        isCorrect: responses[q.id] === q.correctAnswer,
        sequenceNumber: index
      }));
      
      // Calculate time taken (if there was a time limit)
      const timeTaken = testData.timeLimit 
        ? (testData.timeLimit * 60) - (timeRemaining || 0)
        : null;
      
      // Submit test attempt to the server
      const response = await fetch('/api/test-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          testId: testData.id,
          responses: formattedResponses,
          score: calculatedScore,
          timeTaken,
          testType: 'mock'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit test attempt');
      }
      
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Mark test as submitted
      setTestSubmitted(true);
    } catch (err) {
      console.error('Error submitting test:', err);
      // Even if submission fails, show results to the user
      setTestSubmitted(true);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <Card>
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
          The mock test you're looking for doesn't exist. Please go back and select a different test.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Results page after test submission
  if (testSubmitted) {
    return (
      <MockTestResults
        testId={testData.id}
        aircraftSlug={formatParam(aircraft)}
        testTitle={testData.title}
        subject={testData.subject}
        questions={testData.questions}
        responses={responses}
        score={testScore}
        timeTaken={testData.timeLimit ? (testData.timeLimit * 60) - (timeRemaining || 0) : null}
        timeExpired={timeExpired}
        onBackToTests={() => router.push(`/${formatParam(aircraft)}/mock-test/${testData.subject.toLowerCase()}`)}
      />
    );
  }
  
  // Current question
  const currentQuestion = testData.questions[currentQuestionIndex];
  const hasUserAnswered = !!responses[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;
  const answeredCount = Object.keys(responses).length;
  
  // Main test view
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {testData.title}
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {testData.subject} - {testData.aircraft}
          </p>
          
          {timeRemaining !== null && (
            <div className={`flex items-center gap-1 font-mono ${
              timeRemaining < 300 ? 'text-red-500 font-bold' : ''
            }`}>
              <Timer className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </div>
      
      <MockTestProgressHeader
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={testData.questions.length}
        answeredQuestions={answeredCount}
      />
      
      <MockTestQuestionCard
        question={currentQuestion}
        selectedAnswer={responses[currentQuestion.id] || ''}
        onAnswer={handleAnswer}
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-[5]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmitTest}
              disabled={answeredCount < testData.questions.length}
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}