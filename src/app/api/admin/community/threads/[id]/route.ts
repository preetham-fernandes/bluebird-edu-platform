// src/app/api/admin/community/threads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch a specific thread by ID with replies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }
    
    // Fetch thread with replies
    const thread = await prisma.communityMessage.findUnique({
      where: {
        id,
        isThread: true,
        isDeleted: false,
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
        replies: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'asc',
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
        },
      },
    });
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Get module and subject names
    const module = thread.moduleId 
      ? await prisma.aircraft.findUnique({ where: { id: thread.moduleId } })
      : null;
      
    const subject = thread.subjectId
      ? await prisma.title.findUnique({ where: { id: thread.subjectId } })
      : null;
    
    // Format response
    const formattedThread = {
      id: thread.id,
      title: thread.title || 'Untitled Thread',
      content: thread.content,
      createdAt: thread.createdAt,
      moduleId: thread.moduleId || 0,
      moduleName: module?.name || 'Unknown Module',
      subjectId: thread.subjectId || 0,
      subjectName: subject?.name || 'Unknown Subject',
      userId: thread.userId,
      user: thread.user,
      replies: thread.replies,
    };
    
    return NextResponse.json(formattedThread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a thread and all its replies
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }
    
    // Check if thread exists
    const existingThread = await prisma.communityMessage.findUnique({
      where: {
        id,
        isThread: true,
      },
    });
    
    if (!existingThread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Delete thread and all its replies
    await prisma.$transaction(async (tx) => {
      // Delete all reports for this thread and its replies
      await tx.messageReport.deleteMany({
        where: {
          OR: [
            { messageId: id },
            {
              message: {
                parentId: id,
              },
            },
          ],
        },
      });
      
      // Delete all replies to this thread
      await tx.communityMessage.deleteMany({
        where: {
          parentId: id,
        },
      });
      
      // Delete the thread itself
      await tx.communityMessage.delete({
        where: {
          id,
        },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}