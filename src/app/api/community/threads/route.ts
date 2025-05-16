// src/app/api/community/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to create a thread' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, content, moduleId, subjectId } = body;
    
    // Validate input
    if (!title || !content || !moduleId || !subjectId) {
      return NextResponse.json(
        { error: 'Title, content, moduleId, and subjectId are required' },
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
        { error: 'You must accept the community terms before creating a thread' },
        { status: 403 }
      );
    }
    
    // Create the thread
    const thread = await prisma.communityMessage.create({
      data: {
        title,
        content,
        userId: user.id,
        moduleId,
        subjectId,
        isThread: true,
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
    
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}