// src/app/api/community/messages/[id]/upvote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as upvoteService from '@/lib/services/community/upvoteService';

// GET - Get upvote status for a message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ upvoted: false });
    }
    
    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }
    
    const status = await upvoteService.getUpvoteStatus(
      messageId,
      parseInt(session.user.id)
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
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to upvote messages' },
        { status: 401 }
      );
    }
    
    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }
    
    // Toggle upvote
    const result = await upvoteService.toggleUpvote(
      messageId,
      parseInt(session.user.id)
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