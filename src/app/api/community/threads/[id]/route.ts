// src/app/api/community/threads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as threadService from '@/lib/services/community/threadService';

// GET - Get a single thread with replies (no authentication required)
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
    
    const thread = await threadService.getThreadById(threadId);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// PATCH - Update a thread
export async function PATCH(
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
    const { title, content } = body;
    
    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Update thread
    const thread = await threadService.updateThread(
      threadId,
      { title, content },
      userId
    );
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update thread' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a thread
export async function DELETE(
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
    
    // Delete thread
    await threadService.deleteThread(
      threadId,
      userId
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete thread' },
      { status: 500 }
    );
  }
}