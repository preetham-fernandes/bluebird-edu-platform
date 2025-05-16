// src/app/api/community/threads/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const threadId = parseInt(params.threadId);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Get thread with top-level replies
    const thread = await prisma.communityMessage.findUnique({
      where: {
        id: threadId,
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
            createdAt: 'desc',
          },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarChoice: true,
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
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }
    
    // Get total replies count for pagination
    const totalReplies = thread._count.replies;
    
    // Format the thread with reply counts
    const formattedThread = {
      ...thread,
      replies: thread.replies.map(reply => ({
        ...reply,
        replyCount: reply._count.replies,
      })),
    };
    
    return NextResponse.json({
      thread: formattedThread,
      totalReplies,
      currentPage: page,
      totalPages: Math.ceil(totalReplies / limit),
      hasMore: skip + thread.replies.length < totalReplies,
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}