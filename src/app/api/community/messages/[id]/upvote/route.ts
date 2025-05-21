// src/app/api/community/messages/[id]/upvote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as upvoteService from '@/lib/services/community/upvoteService';

// GET - Get upvote status for a message
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
    
    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
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
    
    const status = await upvoteService.getUpvoteStatus(
      messageId,
      userId
    );
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching upvote status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upvote status' },
      { status: 500 }
    );
  }
}

// POST - Toggle upvote for a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const { userId, error } = await getAuthenticatedUserId(request);
    
    // Return error if authentication failed
    if (error) return error;
    
    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
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
    const result = await upvoteService.toggleUpvote(
      messageId,
      userId
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling upvote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}