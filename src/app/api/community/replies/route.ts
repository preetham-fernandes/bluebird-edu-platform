// src/app/api/community/replies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to reply' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { content, parentId } = body;
    
    // Validate input
    if (!content || !parentId) {
      return NextResponse.json(
        { error: 'Content and parentId are required' },
        { status: 400 }
      );
    }
    
    // Get user ID from email
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
    
    // Check if user has accepted community terms
    if (!user.communityTermsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the community terms before replying' },
        { status: 403 }
      );
    }
    
    // Get the parent message to inherit module and subject IDs
    const parentMessage = await prisma.communityMessage.findUnique({
      where: { id: parentId },
      select: { 
        moduleId: true, 
        subjectId: true,
        isThread: true 
      }
    });
    
    if (!parentMessage) {
      return NextResponse.json(
        { error: 'Parent message not found' },
        { status: 404 }
      );
    }
    
    // Create the reply
    const reply = await prisma.communityMessage.create({
      data: {
        content,
        userId: user.id,
        parentId,
        moduleId: parentMessage.moduleId,
        subjectId: parentMessage.subjectId,
        isThread: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarChoice: true,
          },
        },
      },
    });
    
    return NextResponse.json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}