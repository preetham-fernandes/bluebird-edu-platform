// src/app/api/admin/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Define the filter type
type SubjectFilter = {
  aircraftId?: number;
  testTypeId?: number;
};

interface TitleWithTests {
  id: number;
  name: string;
  slug: string;
  aircraftId: number;
  testTypeId: number;
  createdAt: Date;
  updatedAt: Date;
  tests: Array<{
    id: number;
    isActive: boolean;
  }>;
}

// GET endpoint to retrieve subjects (titles)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aircraftId = searchParams.get('aircraftId');
    const testTypeId = searchParams.get('testTypeId');
    
    // If no IDs provided, return error
    if (!aircraftId && !testTypeId) {
      return NextResponse.json(
        { error: 'At least one filter parameter (aircraftId or testTypeId) is required' },
        { status: 400 }
      );
    }
    
    // Build query filter
    const filter: SubjectFilter = {};
    
    if (aircraftId) {
      const aircraftIdNum = parseInt(aircraftId);
      if (isNaN(aircraftIdNum)) {
        return NextResponse.json(
          { error: 'Invalid aircraftId parameter' },
          { status: 400 }
        );
      }
      filter.aircraftId = aircraftIdNum;
    }
    
    if (testTypeId) {
      const testTypeIdNum = parseInt(testTypeId);
      if (isNaN(testTypeIdNum)) {
        return NextResponse.json(
          { error: 'Invalid testTypeId parameter' },
          { status: 400 }
        );
      }
      filter.testTypeId = testTypeIdNum;
    }
    
    // Get subjects with test count
    const subjects = await prisma.title.findMany({
      where: filter,
      include: {
        tests: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Format the response
    const formattedSubjects = subjects.map((subject: TitleWithTests) => ({
      id: subject.id,
      name: subject.name,
      aircraftId: subject.aircraftId,
      testTypeId: subject.testTypeId,
      testCount: subject.tests.length,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    }));
    
    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching subjects' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new subject (title)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.aircraftId || !body.testTypeId) {
      return NextResponse.json(
        { error: 'Subject name, aircraftId, and testTypeId are required' },
        { status: 400 }
      );
    }
    
    // Parse numeric IDs
    const aircraftId = parseInt(body.aircraftId);
    const testTypeId = parseInt(body.testTypeId);
    
    if (isNaN(aircraftId) || isNaN(testTypeId)) {
      return NextResponse.json(
        { error: 'Invalid numeric IDs' },
        { status: 400 }
      );
    }
    
    // Verify that aircraft and test type exist
    const aircraft = await prisma.aircraft.findUnique({
      where: { id: aircraftId },
    });
    
    const testType = await prisma.testType.findUnique({
      where: { id: testTypeId },
    });
    
    if (!aircraft || !testType) {
      return NextResponse.json(
        { error: 'Aircraft or test type not found' },
        { status: 404 }
      );
    }
    
    // Create new subject (title)
    const subject = await prisma.title.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
        aircraftId,
        testTypeId,
      },
    });
    
    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      aircraftId: subject.aircraftId,
      testTypeId: subject.testTypeId,
      testCount: 0,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the subject' },
      { status: 500 }
    );
  }
}