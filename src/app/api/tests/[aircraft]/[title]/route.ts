import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { aircraft: string; title: string } }
) {
  try {
    const { aircraft, title } = params;
    const searchParams = request.nextUrl.searchParams;
    const testType = searchParams.get('testType');
    
    // Find the aircraft by slug or name
    const aircraftEntity = await prisma.aircraft.findFirst({
      where: {
        OR: [
          { slug: aircraft },
          { 
            name: {
              contains: aircraft.split('-').join(' '), 
            } 
          }
        ]
      }
    });
    
    if (!aircraftEntity) {
      return NextResponse.json([]);
    }
    
    // Find the test type if provided
    let testTypeEntity = null;
    if (testType) {
      testTypeEntity = await prisma.testType.findFirst({
        where: {
          type: {
            equals: testType,
          }
        }
      });
      
      if (!testTypeEntity) {
        return NextResponse.json([]);
      }
    }
    
    // Find title based on name or slug
    const titleEntity = await prisma.title.findFirst({
      where: {
        aircraftId: aircraftEntity.id,
        ...(testTypeEntity ? { testTypeId: testTypeEntity.id } : {}),
        OR: [
          { slug: title },
          { 
            name: { 
              contains: title.split('-').join(' '),
            }
          }
        ]
      }
    });
    
    if (!titleEntity) {
      return NextResponse.json([]);
    }
    
    // Get tests for this title that are active
    const tests = await prisma.test.findMany({
      where: {
        aircraftId: aircraftEntity.id,
        titleId: titleEntity.id,
        isActive: true
      },
      include: {
        titleRef: true,
        questions: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the response
    const formattedTests = tests.map((test: {
      id: number;
      title: string;
      titleRef?: { name: string } | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: test.id,
      title: test.title,
      subject: test.titleRef?.name || '',
      isActive: test.isActive,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    }));
    
    return NextResponse.json(formattedTests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tests' },
      { status: 500 }
    );
  }
} 