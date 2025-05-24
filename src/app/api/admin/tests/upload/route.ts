// src/app/api/admin/tests/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseCsvFile, parseExcelFile, parseTxtFile } from '@/lib/fileProcessing/textParser';
import prisma from '@/lib/db/prisma';

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
    
    console.log(`Starting upload of ${questions.length} questions`);

    // Create the test using resilient approach (not TestUploadService)
    try {
      // Step 1: Find the subject/title to validate it exists
      const subject = await prisma.title.findFirst({
        where: {
          id: subjectIdNum,
          aircraftId: aircraftIdNum,
          testTypeId: testTypeIdNum,
        },
      });

      if (!subject) {
        return NextResponse.json(
          { error: 'Invalid subject, aircraft, or test type combination' },
          { status: 400 }
        );
      }

      // Step 2: Deactivate existing tests
      console.log('Deactivating existing tests...');
      await prisma.test.updateMany({
        where: {
          titleId: subject.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Step 3: Create the new test
      console.log('Creating new test...');
      const test = await prisma.test.create({
        data: {
          title: title,
          titleId: subject.id,
          aircraftId: aircraftIdNum,
          totalQuestions: questions.length,
          timeLimit: timeLimitNum,
          updatedBy: 1, // Admin ID
          isActive: true,
        },
      });

      console.log(`Created test with ID: ${test.id}`);

      // Step 4: Process questions in small batches to avoid transaction timeouts
      const BATCH_SIZE = 3; // Process only 3 questions at a time
      let questionsUploaded = 0;
      let errorsEncountered = 0;

      for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = questions.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(questions.length / BATCH_SIZE);
        
        console.log(`Processing batch ${batchNumber}/${totalBatches} (questions ${i + 1}-${i + batch.length})`);
        
        try {
          // Process each batch in its own transaction
          await prisma.$transaction(async (tx) => {
            for (let j = 0; j < batch.length; j++) {
              const question = batch[j];
              const questionNumber = i + j + 1;
              
              // Create the question
              const createdQuestion = await tx.question.create({
                data: {
                  testId: test.id,
                  questionNumber: questionNumber,
                  questionText: question.text,
                  correctAnswer: question.correctAnswer,
                  explanation: question.explanation || null,
                },
              });

              // Create options for this question
              const isTrueFalseQuestion = question.options.length === 2;
              
              // Create the available options
              for (const option of question.options) {
                await tx.option.create({
                  data: {
                    questionId: createdQuestion.id,
                    label: option.id,
                    optionText: option.text,
                    isCorrect: option.id === question.correctAnswer,
                  },
                });
              }

              // For True/False questions, add empty C and D options
              if (isTrueFalseQuestion) {
                const missingOptions = ['C', 'D'].filter(id => 
                  !question.options.some(o => o.id === id)
                );
                
                for (const missingLabel of missingOptions) {
                  await tx.option.create({
                    data: {
                      questionId: createdQuestion.id,
                      label: missingLabel,
                      optionText: '',
                      isCorrect: false,
                    },
                  });
                }
              }
            }
          }, {
            maxWait: 5000,  // 5 seconds max wait
            timeout: 10000, // 10 seconds timeout per batch
          });

          questionsUploaded += batch.length;
          console.log(`✅ Batch ${batchNumber} completed. Progress: ${questionsUploaded}/${questions.length}`);
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (batchError) {
          console.error(`❌ Error in batch ${batchNumber}:`, batchError);
          errorsEncountered += batch.length;
          
          // Continue with next batch instead of failing completely
          continue;
        }
      }

      console.log(`Upload completed. Success: ${questionsUploaded}, Errors: ${errorsEncountered}`);

      // Update the test with actual question count if different
      if (questionsUploaded !== questions.length) {
        await prisma.test.update({
          where: { id: test.id },
          data: { totalQuestions: questionsUploaded },
        });
      }
      
      // Return success response
      return NextResponse.json({
        status: 'success',
        message: 'Test created successfully',
        data: {
          testId: test.id,
          title: test.title,
          totalQuestions: questionsUploaded,
          questionsUploaded: questionsUploaded,
          errorsEncountered: errorsEncountered,
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