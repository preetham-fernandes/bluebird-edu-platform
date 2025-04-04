// src/app/api/practice-tests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as testService from '@/lib/services/testService';

// GET endpoint to retrieve a test by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = parseInt(params.id);
    
    if (isNaN(testId)) {
      return NextResponse.json({ error: 'Invalid test ID' }, { status: 400 });
    }
    
    const test = await testService.getPracticeTestById(testId);
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the test' },
      { status: 500 }
    );
  }
}