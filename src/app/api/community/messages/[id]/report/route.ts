// src/app/api/community/messages/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as communityService from '@/lib/services/communityService';

// POST endpoint to report a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be signed in to report messages' },
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
    
    const body = await request.json();
    const { reason } = body;
    
    // Report the message
    await communityService.reportMessage(
      messageId,
      parseInt(session.user.id),
      reason
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reporting message:', error);
    return NextResponse.json(
      { error: 'Failed to report message' },
      { status: 500 }
    );
  }
}