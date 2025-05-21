// src/app/api/community/threads/[id]/upvote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as threadUpvoteService from '@/lib/services/community/threadUpvoteService';

// GET - Get upvote status for a thread
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const { userId, error } = await getAuthenticatedUserId(request);
    
    // If not authenticated, return not upvoted
    if (error) {
      return NextResponse.json({ upvoted: false });
    }
    
    const threadId = parseInt(params.id);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }

    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }
    
    const status = await threadUpvoteService.getThreadUpvoteStatus(
      threadId,
      userId
    );
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching thread upvote status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upvote status' },
      { status: 500 }
    );
  }
}

// POST - Toggle upvote for a thread
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

    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Toggle upvote
    const result = await threadUpvoteService.toggleThreadUpvote(
      threadId,
      userId
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling thread upvote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}