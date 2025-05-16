// src/app/api/community/subjects/[subjectId]/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const subjectId = parseInt(params.subjectId);
    
    if (isNaN(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get threads for this subject
    const threads = await prisma.communityMessage.findMany({
      where: {
        subjectId,
        isThread: true,
        isDeleted: false,
        parentId: null,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const totalCount = await prisma.communityMessage.count({
      where: {
        subjectId,
        isThread: true,
        isDeleted: false,
        parentId: null,
      },
    });
    
    // Format response
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      createdAt: thread.createdAt,
      user: thread.user,
      replyCount: thread._count.replies,
    }));
    
    return NextResponse.json({
      threads: formattedThreads,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + threads.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}