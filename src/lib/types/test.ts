// src/lib/types/test.ts

// Test types
export interface TestOption {
    id: number;
    label: string;
    text: string;
  }
  
  export interface TestQuestion {
    id: number;
    questionNumber: number;
    questionText: string;
    options: TestOption[];
    correctAnswer: string;
    explanation: string;
  }
  
  export interface Test {
    id: number;
    title: string;
    aircraft: string;
    aircraftId: number;
    subject: string;
    totalQuestions: number;
    timeLimit: number | null;
    questions: TestQuestion[];
  }
  
  // Test attempt types
  export interface QuestionResponse {
    questionId: number;
    userAnswer: string;
    isCorrect: boolean;
    sequenceNumber: number;
  }
  
  export interface TestAttemptCreateInput {
    userId: number;
    testId: number;
    responses: QuestionResponse[];
    score: number;
    timeTaken?: number | null;
  }
  
  export interface TestAttemptResponse {
    questionId: number;
    questionNumber: number;
    questionText: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean | null;
    explanation: string;
  }
  
  export interface TestAttempt {
    id: number;
    userId: number;
    testId: number;
    testTitle: string;
    aircraftName: string;
    subject: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    passFail: boolean | null;
    totalQuestions: number;
    correctAnswers: number;
    attemptNumber: number;
    responses: TestAttemptResponse[];
  }
  
  export interface TestAttemptSummary {
    id: number;
    testId: number;
    testTitle: string;
    subject: string;
    aircraftName: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    passFail: boolean | null;
    attemptNumber: number;
  }