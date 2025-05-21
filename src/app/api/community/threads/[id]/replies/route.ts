// src/app/api/community/threads/[id]/replies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import * as messageService from '@/lib/services/community/messageService';
import * as threadService from '@/lib/services/community/threadService';

// POST - Add a reply to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession();
    
    // Log the session for debugging
    console.log("Thread reply session:", session);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to reply to threads' },
        { status: 401 }
      );
    }
    
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
    
    // Create reply
    const reply = await messageService.createThreadReply(
      threadId,
      content,
      parseInt(session.user.id)
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

// GET - Get replies for a thread
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