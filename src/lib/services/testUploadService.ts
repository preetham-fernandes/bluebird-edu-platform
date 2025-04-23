// src/lib/services/testUploadService.ts
import { PrismaClient } from '@prisma/client';
import { QuestionData } from '../fileProcessing/textParser';
import prisma from '../db/prisma';

/**
 * Interface for the test upload request
 */
export interface TestUploadRequest {
  title: string;
  aircraftId: number;
  subjectId: number; // This is the titleId in the database
  testTypeId: number;
  timeLimit: number | null;
  questions: QuestionData[];
}

/**
 * Service for handling test uploads
 */
export class TestUploadService {
  /**
   * Creates a new test with questions and options
   */
  static async createTest(uploadData: TestUploadRequest) {
    try {
      // Use a transaction to ensure data consistency
      return await prisma.$transaction(async (tx) => {
        // 1. Deactivate any existing active tests for this subject
        await tx.test.updateMany({
          where: {
            titleId: uploadData.subjectId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
        
        // 2. Create the new test
        const test = await tx.test.create({
          data: {
            title: uploadData.title,
            titleId: uploadData.subjectId,
            aircraftId: uploadData.aircraftId,
            totalQuestions: uploadData.questions.length,
            timeLimit: uploadData.timeLimit,
            updatedBy: 1, // This should come from auth context in a real app
          },
        });
        
        // 3. Create all questions and their options
        for (let i = 0; i < uploadData.questions.length; i++) {
          const questionData = uploadData.questions[i];
          
          // Create the question
          const question = await tx.question.create({
            data: {
              testId: test.id,
              questionNumber: i + 1, // Use sequential numbers
              questionText: questionData.text,
              correctAnswer: questionData.correctAnswer,
              explanation: questionData.explanation || null,
            },
          });
          
          // Create options for this question
          const optionPromises = questionData.options.map((option) => 
            tx.option.create({
              data: {
                questionId: question.id,
                label: option.id,
                optionText: option.text,
                isCorrect: option.id === questionData.correctAnswer,
              },
            })
          );
          
          await Promise.all(optionPromises);
        }
        
        // 4. Return the created test with count information
        return {
          testId: test.id,
          title: test.title,
          totalQuestions: test.totalQuestions,
          subjectId: test.titleId,
          aircraftId: test.aircraftId,
        };
      });
    } catch (error) {
      console.error('Error in test upload service:', error);
      throw error;
    }
  }
  
  /**
   * Gets the details of a test by ID
   */
  static async getTestById(testId: number) {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          aircraft: true,
          titleRef: true,
          questions: {
            orderBy: {
              questionNumber: 'asc',
            },
            include: {
              options: {
                orderBy: {
                  label: 'asc',
                },
              },
            },
          },
        },
      });
      
      return test;
    } catch (error) {
      console.error('Error getting test by ID:', error);
      throw error;
    }
  }
}