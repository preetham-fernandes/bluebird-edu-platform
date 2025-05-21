// src/app/api/community/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as threadService from '@/lib/services/community/threadService';

// POST - Create a new thread
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID
    const { userId, error } = await getAuthenticatedUserId(request);
    
    // Return error if authentication failed
    if (error) return error;

    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { title, content } = body;
    
    // TODO: Check subscription status
    
    // Create thread
    const thread = await threadService.createThread(
      title,
      content,
      userId
    );
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create thread' },
      { status: 500 }
    );
  }
}

// GET - List all threads (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const threads = await threadService.getThreads(page, limit);
    
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}