// src/app/api/community/messages/[id]/replies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as messageService from '@/lib/services/community/messageService';

// GET - Get replies for a message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const replies = await messageService.getMessageReplies(messageId, page, limit);
    
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error fetching message replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message replies' },
      { status: 500 }
    );
  }
}

// POST - Add a reply to a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to reply to messages' },
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
    
    // Parse request body
    const body = await request.json();
    const { content } = body;
    
    // TODO: Check subscription status
    
    // Create reply
    const reply = await messageService.createMessageReply(
      messageId,
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