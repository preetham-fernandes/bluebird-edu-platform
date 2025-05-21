// src/app/api/community/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as messageService from '@/lib/services/community/messageService';

// GET - Get a single message with context (no authentication required)
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
    
    const message = await messageService.getMessageById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

// PATCH - Update a message
export async function PATCH(
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
    
    // Parse request body
    const body = await request.json();
    const { content } = body;
    
    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Update message
    const message = await messageService.updateMessage(
      messageId,
      content,
      userId
    );
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(
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
    

    // Delete message
    await messageService.deleteMessage(
      messageId,
      userId
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete message' },
      { status: 500 }
    );
  }
}