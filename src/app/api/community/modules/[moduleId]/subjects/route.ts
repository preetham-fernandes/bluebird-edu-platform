// src/app/api/community/modules/[moduleId]/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleId = parseInt(params.moduleId);
    
    if (isNaN(moduleId)) {
      return NextResponse.json(
        { error: 'Invalid module ID' },
        { status: 400 }
      );
    }
    
    // Use Title model as subjects
    const subjects = await prisma.title.findMany({
      where: {
        aircraftId: moduleId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            // Count messages that are threads for this subject
            CommunityMessage: {
              where: {
                isThread: true,
                isDeleted: false,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Format response
    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      threadCount: subject._count.CommunityMessage,
    }));
    
    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}