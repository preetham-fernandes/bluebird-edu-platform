// src/app/api/community/threads/[id]/replies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as messageService from '@/lib/services/community/messageService';
import * as threadService from '@/lib/services/community/threadService';

// POST - Add a reply to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const { userId, error } = await getAuthenticatedUserId(request);
    
    // Return error if authentication failed
    if (error) return error;
    
    const threadId = parseInt(params.id);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { content } = body;
    
    // TODO: Check subscription status
    
    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }
    

    // Create reply
    const reply = await messageService.createThreadReply(
      threadId,
      content,
      userId
    );
    
    return NextResponse.json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create reply' },
      { status: 500 }
    );
  }
}

// GET - Get replies for a thread (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = parseInt(params.id);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const replies = await threadService.getThreadReplies(threadId, page, limit);
    
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error fetching thread replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread replies' },
      { status: 500 }
    );
  }
}