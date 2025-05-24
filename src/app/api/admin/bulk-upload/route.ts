// src/app/api/admin/bulk-upload/route.ts
// TypeScript-safe version with proper types
import { NextRequest, NextResponse } from 'next/server';
import { parseTxtFile } from '@/lib/fileProcessing/textParser';
import prisma from '@/lib/db/prisma';

// Define interfaces for better type safety
interface CreatedQuestion {
  id: number;
  questionNumber: number;
  testId: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const aircraftId = formData.get('aircraftId') as string;
    const testTypeId = formData.get('testTypeId') as string;
    const subjectId = formData.get('subjectId') as string;

    if (!file || !aircraftId || !testTypeId || !subjectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse the numeric IDs
    const aircraftIdNum = parseInt(aircraftId);
    const testTypeIdNum = parseInt(testTypeId);
    const subjectIdNum = parseInt(subjectId);

    if (isNaN(aircraftIdNum) || isNaN(testTypeIdNum) || isNaN(subjectIdNum)) {
      return NextResponse.json(
        { error: 'Invalid ID values' },
        { status: 400 }
      );
    }

    // Verify that the IDs exist and are valid
    const subject = await prisma.title.findFirst({
      where: {
        id: subjectIdNum,
        aircraftId: aircraftIdNum,
        testTypeId: testTypeIdNum,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Invalid subject, aircraft, or test type' },
        { status: 400 }
      );
    }

    // Process the file - only accept text files
    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Unsupported file format. Only .txt files are supported.' },
        { status: 400 }
      );
    }
    
    const txtText = new TextDecoder().decode(fileBuffer);
    const questions = await parseTxtFile(txtText);

    // Use a transaction with increased timeout for bulk operations
    const result = await prisma.$transaction(async (tx) => {
      // First, deactivate any existing active tests for this title
      await tx.test.updateMany({
        where: {
          titleId: subject.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      
      // Create a new test entry
      const test = await tx.test.create({
        data: {
          title: `${subject.name} Test`,
          titleId: subject.id,
          aircraftId: aircraftIdNum,
          totalQuestions: questions.length,
          timeLimit: null, 
          updatedBy: 1, // Admin ID
          isActive: true,
        },
      });

      // Prepare bulk data for questions
      const questionsData = questions.map((question, index) => ({
        testId: test.id,
        questionNumber: index + 1,
        questionText: question.text,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || null,
      }));

      // Bulk create questions
      await tx.question.createMany({
        data: questionsData,
      });

      // Get the created questions (they should be sequential)
      const createdQuestions = await tx.question.findMany({
        where: {
          testId: test.id,
        },
        orderBy: {
          questionNumber: 'asc',
        },
        select: {
          id: true,
          questionNumber: true,
          testId: true,
        },
      });

      // Prepare bulk data for options
      const optionsData: Array<{
        questionId: number;
        label: string;
        optionText: string;
        isCorrect: boolean;
      }> = [];

      createdQuestions.forEach((createdQuestion: CreatedQuestion, questionIndex: number) => {
        const question = questions[questionIndex];
        const isTrueFalseQuestion = question.options.length === 2;

        // Add the available options
        question.options.forEach(option => {
          optionsData.push({
            questionId: createdQuestion.id,
            label: option.id,
            optionText: option.text,
            isCorrect: option.id === question.correctAnswer,
          });
        });

        // If it's a True/False question, add empty C and D options for database integrity
        if (isTrueFalseQuestion) {
          const missingOptions = ['C', 'D'].filter(id => 
            !question.options.some(o => o.id === id)
          );
          
          missingOptions.forEach(missingLabel => {
            optionsData.push({
              questionId: createdQuestion.id,
              label: missingLabel,
              optionText: '',
              isCorrect: false,
            });
          });
        }
      });

      // Bulk create options in chunks to avoid memory issues
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < optionsData.length; i += CHUNK_SIZE) {
        const chunk = optionsData.slice(i, i + CHUNK_SIZE);
        await tx.option.createMany({
          data: chunk,
        });
      }

      return {
        test,
        questionsUploaded: questions.length,
        errorsEncountered: 0,
      };
    }, {
      maxWait: 20000, // 20 seconds max wait
      timeout: 30000, // 30 seconds timeout
    });

    // Return success response with summary
    return NextResponse.json({
      status: 'success',
      questionsUploaded: result.questionsUploaded,
      errorsEncountered: result.errorsEncountered,
      test: {
        id: result.test.id,
        title: result.test.title,
        totalQuestions: result.test.totalQuestions,
      },
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    
    // Handle specific Prisma timeout errors
    if (error instanceof Error && error.message.includes('Transaction')) {
      return NextResponse.json(
        { 
          error: 'Upload timeout - file too large or complex',
          message: 'Please try uploading a smaller file or contact support for assistance with large uploads.' 
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}