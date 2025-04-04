// src/app/api/test-attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as testAttemptService from '@/lib/services/testAttemptService';

// POST endpoint to create a new test attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract test attempt data from request body
    const { userId, testId, responses, score } = body;
    
    if (!userId || !testId || !responses || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new test attempt
    const testAttempt = await testAttemptService.createTestAttempt({
      userId,
      testId,
      responses,
      score,
      // Note: We're not including timeTaken since it's not required
    });
    
    return NextResponse.json(testAttempt);
  } catch (error) {
    console.error('Error creating test attempt:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the test attempt' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve test attempts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const testId = searchParams.get('testId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    // Parse userId as number
    const userIdNum = parseInt(userId);
    
    // Parse testId as number if provided
    let testIdNum: number | undefined;
    if (testId) {
      testIdNum = parseInt(testId);
      if (isNaN(testIdNum)) {
        return NextResponse.json(
          { error: 'Invalid testId parameter' },
          { status: 400 }
        );
      }
    }
    
    // Get test attempts by userId and optional testId
    const testAttempts = await testAttemptService.getTestAttemptsByUser(
      userIdNum,
      testIdNum
    );
    
    return NextResponse.json(testAttempts);
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching test attempts' },
      { status: 500 }
    );
  }
}