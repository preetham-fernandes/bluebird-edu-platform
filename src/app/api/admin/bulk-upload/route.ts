// src/app/api/admin/bulk-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseTxtFile } from '@/lib/fileProcessing/textParser';
import prisma from '@/lib/db/prisma';

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

    // First, deactivate any existing active tests for this title
    await prisma.test.updateMany({
        where: {
          titleId: subject.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      
      // Then create a new test entry
      const test = await prisma.test.create({
        data: {
          title: `${subject.name} Test`,
          titleId: subject.id,
          aircraftId: aircraftIdNum,
          totalQuestions: questions.length,
          // timeLimit is optional, typically set for mock tests
          timeLimit: null, 
          updatedBy: 1, // Admin ID (would be from auth context in real app)
          isActive: true,
        },
      });

    // Create questions and options
    const errorsEncountered = 0;
    const questionsUploaded = questions.length;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Create the question
      const createdQuestion = await prisma.question.create({
        data: {
          testId: test.id,
          questionNumber: i + 1, // Use sequential numbers regardless of what's in the file
          questionText: question.text,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || null,
        },
      });

      // Create options for this question - supporting both multiple choice and True/False
      const isTrueFalseQuestion = question.options.length === 2;

      // Create the available options
      for (const option of question.options) {
        await prisma.option.create({
          data: {
            questionId: createdQuestion.id,
            label: option.id,
            optionText: option.text,
            isCorrect: option.id === question.correctAnswer,
          },
        });
      }

      // If it's a True/False question, we need to ensure database integrity by adding empty C and D options
      if (isTrueFalseQuestion) {
        const missingOptions = ['C', 'D'].filter(id => !question.options.some(o => o.id === id));
        
        for (const missingLabel of missingOptions) {
          await prisma.option.create({
            data: {
              questionId: createdQuestion.id,
              label: missingLabel,
              optionText: '', // Empty text for missing options
              isCorrect: false,
            },
          });
        }
      }
    }

    // Return success response with summary
    return NextResponse.json({
      status: 'success',
      questionsUploaded,
      errorsEncountered,
      test: {
        id: test.id,
        title: test.title,
        totalQuestions: test.totalQuestions,
      },
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}