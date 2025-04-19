// src/app/api/admin/tests/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseCsvFile, parseExcelFile, parseTxtFile } from '@/lib/fileProcessing/textParser';
import { TestUploadService } from '@/lib/services/testUploadService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get all required fields from the form data
    const file = formData.get('file') as File | null;
    const aircraftId = formData.get('aircraftId') as string;
    const testTypeId = formData.get('testTypeId') as string;
    const subjectId = formData.get('subjectId') as string;
    const title = formData.get('title') as string;
    const timeLimit = formData.get('timeLimit') as string | null;
    
    // Validate required fields
    if (!file || !aircraftId || !testTypeId || !subjectId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Parse numeric values
    const aircraftIdNum = parseInt(aircraftId);
    const testTypeIdNum = parseInt(testTypeId);
    const subjectIdNum = parseInt(subjectId);
    const timeLimitNum = timeLimit ? parseInt(timeLimit) : null;
    
    if (isNaN(aircraftIdNum) || isNaN(testTypeIdNum) || isNaN(subjectIdNum) || 
        (timeLimit !== null && isNaN(timeLimitNum as number))) {
      return NextResponse.json(
        { error: 'Invalid numeric values' },
        { status: 400 }
      );
    }
    
    // Read the file content
    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    
    // Parse the file based on its extension
    let questions;
    try {
      if (fileName.endsWith('.csv')) {
        const csvText = new TextDecoder().decode(fileBuffer);
        questions = await parseCsvFile(csvText);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        questions = await parseExcelFile(fileBuffer);
      } else if (fileName.endsWith('.txt')) {
        const txtText = new TextDecoder().decode(fileBuffer);
        questions = await parseTxtFile(txtText);
      } else {
        return NextResponse.json(
          { error: 'Unsupported file format' },
          { status: 400 }
        );
      }
      
      // Validate that we have questions
      if (!questions || questions.length === 0) {
        return NextResponse.json(
          { error: 'No valid questions found in the file' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse file', 
          message: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 400 }
      );
    }
    
    // Create the test using the service
    try {
      const result = await TestUploadService.createTest({
        title,
        aircraftId: aircraftIdNum,
        subjectId: subjectIdNum,
        testTypeId: testTypeIdNum,
        timeLimit: timeLimitNum,
        questions,
      });
      
      // Return success response
      return NextResponse.json({
        status: 'success',
        message: 'Test created successfully',
        data: {
          testId: result.testId,
          title: result.title,
          totalQuestions: result.totalQuestions,
          questionsUploaded: questions.length,
        }
      });
    } catch (dbError) {
      console.error('Database error during test creation:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to create test in database', 
          message: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in test upload:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}