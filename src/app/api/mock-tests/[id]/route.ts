// src/app/api/mock-tests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as testService from '@/lib/services/testService';

// GET endpoint to retrieve a mock test by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const testId = parseInt(params.id);
      
      console.log(`Mock test API called with ID: ${testId}`); // Add logging
      
      if (isNaN(testId)) {
        return NextResponse.json({ error: 'Invalid test ID' }, { status: 400 });
      }
      
      const test = await testService.getMockTestById(testId);
      
      console.log(`API result: ${test ? 'Test found' : 'Test not found'}`); // Add logging
      if (test) {
        console.log(`Test title: ${test.title}, Questions: ${test.questions.length}`);
      }
      
      if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
      }
      
      return NextResponse.json(test);
    } catch (error) {
      console.error('Error fetching mock test:', error);
      return NextResponse.json(
        { error: 'An error occurred while fetching the test' },
        { status: 500 }
      );
    }
  }