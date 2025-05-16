// src/app/api/admin/community/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch all subjects with module names and thread counts
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
    
    // Fetch all subjects (titles in your system)
    const subjects = await prisma.title.findMany({
      orderBy: [
        { aircraftId: 'asc' },
        { name: 'asc' },
      ],
      include: {
        aircraft: true,
        _count: {
          select: {
            // Count messages that are threads for this subject
            communityMessages: {
              where: {
                isThread: true,
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    
    // Format response with module names and thread counts
    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      moduleId: subject.aircraftId,
      moduleName: subject.aircraft?.name || 'Unknown Module',
      threadCount: subject._count.communityMessages,
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

// POST - Create a new subject
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, slug, moduleId } = body;
    
    // Validate required fields
    if (!name || !slug || !moduleId) {
      return NextResponse.json(
        { error: 'Name, slug, and moduleId are required' },
        { status: 400 }
      );
    }
    
    // Check if module exists
    const module = await prisma.aircraft.findUnique({
      where: { id: moduleId },
    });
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Check if slug+moduleId combination already exists (unique constraint)
    const existingSubject = await prisma.title.findFirst({
      where: {
        slug,
        aircraftId: moduleId,
      },
    });
    
    if (existingSubject) {
      return NextResponse.json(
        { error: 'A subject with this slug already exists in this module' },
        { status: 409 }
      );
    }
    
    // Create the subject
    // NOTE: Since we're not using testTypeId in community threads, we'll use a default value of 1
    // You may need to adapt this to your system
    const newSubject = await prisma.title.create({
      data: {
        name,
        slug,
        aircraftId: moduleId,
        testTypeId: 1, // Default value for testTypeId
      },
      include: {
        aircraft: true,
      },
    });
    
    // Format response
    const formattedSubject = {
      id: newSubject.id,
      name: newSubject.name,
      slug: newSubject.slug,
      moduleId: newSubject.aircraftId,
      moduleName: newSubject.aircraft?.name || 'Unknown Module',
      threadCount: 0,
    };
    
    return NextResponse.json(formattedSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}