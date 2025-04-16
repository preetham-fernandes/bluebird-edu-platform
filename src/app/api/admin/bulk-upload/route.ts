// src/app/api/admin/bulk-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile, parseCsvFile } from '@/lib/fileProcessing';
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

    // Process the file based on its type
    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    
    let questions;
    if (fileName.endsWith('.csv')) {
      const csvText = new TextDecoder().decode(fileBuffer);
      questions = await parseCsvFile(csvText);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      questions = await parseExcelFile(fileBuffer);
    } else if (fileName.endsWith('.txt')) {
      const txtText = new TextDecoder().decode(fileBuffer);
      // Assume the text file is in CSV format
      questions = await parseCsvFile(txtText);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // Create a test entry
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
        // Deactivate any previous active tests for this title
        tests: {
          updateMany: {
            where: {
              titleId: subject.id,
              isActive: true,
            },
            data: {
              isActive: false,
            },
          },
        },
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

      // Create options for this question
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