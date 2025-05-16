// src/lib/db/repositories/testAttemptRepository.ts
import prisma from '../db/prisma';
import { TestAttemptCreateInput } from '@/lib/types/test';

// Create a new test attempt
export const createTestAttempt = async (data: TestAttemptCreateInput) => {
  const { userId, testId, responses, score, timeTaken, testType } = data;
  
  // First, create the test attempt
  const testAttempt = await prisma.testAttempt.create({
    data: {
      userId,
      testId,
      score,
      timeTaken, // Include time taken for mock tests
      status: 'completed',
      testSnapshot: {},  // Empty JSON object for simple tests
      attemptNumber: await getNextAttemptNumber(userId, testId),
      passFail: score >= 70, // Default passing threshold of 70%
      completedAt: new Date(),
    },
  });
  
  // Then, create all question responses
  if (responses && responses.length > 0) {
    for (const response of responses) {
      await prisma.questionResponse.create({
        data: {
          testAttemptId: testAttempt.id,
          questionId: response.questionId,
          userAnswer: response.userAnswer,
          isCorrect: response.isCorrect,
          sequenceNumber: response.sequenceNumber,
        },
      });
    }
  }
  
  return getTestAttemptById(testAttempt.id);
};

// Get a test attempt by ID
export const getTestAttemptById = async (id: number) => {
  return prisma.testAttempt.findUnique({
    where: { id },
    include: {
      test: {
        include: {
          titleRef: {
            include: {
              testType: true, // Include test type
            },
          },
          aircraft: true,
        },
      },
      questionResponses: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
        orderBy: {
          sequenceNumber: 'asc',
        },
      },
    },
  });
};

// Get test attempts by user ID and optional test ID
export const getTestAttemptsByUser = async (
  userId: number,
  testId?: number,
  testType?: 'mock' | 'practice'
) => {
  return prisma.testAttempt.findMany({
    where: {
      userId,
      ...(testId ? { testId } : {}),
      ...(testType ? { 
        test: {
          titleRef: {
            testType: {
              type: testType
            }
          }
        } 
      } : {}),
    },
    include: {
      test: {
        include: {
          titleRef: {
            include: {
              testType: true,
            },
          },
          aircraft: true,
        },
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  });
};

// Get the next attempt number for a user-test combination
export const getNextAttemptNumber = async (
  userId: number,
  testId: number
): Promise<number> => {
  const attempts = await prisma.testAttempt.findMany({
    where: {
      userId,
      testId,
    },
    orderBy: {
      attemptNumber: 'desc',
    },
    take: 1,
  });
  
  return attempts.length > 0 ? attempts[0].attemptNumber + 1 : 1;
};