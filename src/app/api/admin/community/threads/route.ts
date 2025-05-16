// src/app/api/admin/community/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch all threads with module and subject names
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Fetch all threads (isThread=true messages)
    const threads = await prisma.communityMessage.findMany({
      where: {
        isThread: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            replies: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    
    // Fetch all modules and subjects for lookup
    const modules = await prisma.aircraft.findMany();
    const subjects = await prisma.title.findMany();
    
    // Create lookup maps
    const moduleMap = new Map(modules.map(m => [m.id, m.name]));
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
    
    // Format response with module and subject names
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      title: thread.title || 'Untitled Thread',
      content: thread.content,
      createdAt: thread.createdAt,
      moduleId: thread.moduleId || 0,
      moduleName: thread.moduleId ? moduleMap.get(thread.moduleId) || 'Unknown Module' : 'Unknown Module',
      subjectId: thread.subjectId || 0,
      subjectName: thread.subjectId ? subjectMap.get(thread.subjectId) || 'Unknown Subject' : 'Unknown Subject',
      userId: thread.userId,
      userName: thread.user.username || thread.user.name,
      replyCount: thread._count.replies,
    }));
    
    return NextResponse.json(formattedThreads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}