// src/lib/services/testAttemptService.ts
import * as testAttemptRepository from '../db/repositories/testAttemptRepository';
import { TestAttemptCreateInput } from '@/lib/types/test';

// Create a new test attempt
export const createTestAttempt = async (data: TestAttemptCreateInput) => {
  return testAttemptRepository.createTestAttempt(data);
};

// Get test attempt by ID
export const getTestAttemptById = async (id: number) => {
  const attempt = await testAttemptRepository.getTestAttemptById(id);
  
  if (!attempt) {
    return null;
  }
  
  // Calculate some statistics
  const totalQuestions = attempt.questionResponses.length;
  const correctAnswers = attempt.questionResponses.filter(r => r.isCorrect).length;
  const score = (correctAnswers / totalQuestions) * 100;
  
  // Structure the response data
  return {
    id: attempt.id,
    userId: attempt.userId,
    testId: attempt.testId,
    testTitle: attempt.test.title,
    aircraftName: attempt.test.aircraft.name,
    subject: attempt.test.titleRef?.name || '',
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    score: attempt.score || score,
    passFail: attempt.passFail,
    totalQuestions,
    correctAnswers,
    attemptNumber: attempt.attemptNumber,
    responses: attempt.questionResponses.map(response => ({
      questionId: response.questionId,
      questionNumber: response.question.questionNumber,
      questionText: response.question.questionText,
      userAnswer: response.userAnswer,
      correctAnswer: response.question.correctAnswer,
      isCorrect: response.isCorrect,
      explanation: response.question.explanation || '',
    })),
  };
};

// Get test attempts by user ID and optional test ID
export const getTestAttemptsByUser = async (
  userId: number,
  testId?: number
) => {
  const attempts = await testAttemptRepository.getTestAttemptsByUser(userId, testId);
  
  // Transform the data for the client
  return attempts.map(attempt => ({
    id: attempt.id,
    testId: attempt.testId,
    testTitle: attempt.test.title,
    subject: attempt.test.titleRef?.name || '',
    aircraftName: attempt.test.aircraft.name,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    score: attempt.score,
    passFail: attempt.passFail,
    attemptNumber: attempt.attemptNumber,
  }));
};