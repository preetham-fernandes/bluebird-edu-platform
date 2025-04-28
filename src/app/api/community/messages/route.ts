// src/app/api/community/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as communityService from '@/lib/services/communityService';
import prisma from '@/lib/db/prisma';

// GET endpoint to retrieve messages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const parentId = searchParams.get('parentId') 
      ? parseInt(searchParams.get('parentId') as string) 
      : null;
    
    // If parentId is provided, get replies to that message
    // Otherwise, get top-level messages
    const result = parentId 
      ? await communityService.getReplies(parentId, page, limit)
      : await communityService.getMessages(page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Debug the session to see what's available
    console.log("Session in messages POST:", JSON.stringify(session, null, 2));
    
    // Check if user is authenticated - use a more flexible check
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to post messages' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { content, parentId } = body;
    
    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Find the user ID from session or look up by email
    let userId: number;
    
    if (session.user.id) {
      // Use the ID directly if available in session
      userId = parseInt(session.user.id);
    } else {
      // Otherwise look up the user by email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, communityTermsAccepted: true }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      userId = user.id;
      
      // Check terms acceptance from the database
      if (!user.communityTermsAccepted) {
        return NextResponse.json(
          { error: 'You must accept the community terms before posting' },
          { status: 403 }
        );
      }
    }
    
    // Create the message
    const message = await communityService.createMessage(
      content,
      userId,
      parentId ? parseInt(parentId) : undefined
    );
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}