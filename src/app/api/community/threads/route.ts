// src/app/api/community/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import * as threadService from '@/lib/services/community/threadService';

// POST - Create a new thread
export async function POST(request: NextRequest) {
  try {
    // Get the session without passing authOptions
    const session = await getServerSession();
    
    // Debug the session to see what we're getting
    console.log("Thread creation session:", session);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      console.log("Auth failed for thread creation, session:", session);
      return NextResponse.json(
        { error: 'You must be signed in to create threads' },
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
      parseInt(session.user.id)
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

// GET - List all threads
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