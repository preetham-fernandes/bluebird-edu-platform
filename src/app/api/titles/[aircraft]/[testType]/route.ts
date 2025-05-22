import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { aircraft: string; testType: string } }
) {
  try {
    const { aircraft, testType } = params;
    
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
    
    // Find the test type by type
    const testTypeEntity = await prisma.testType.findFirst({
      where: {
        type: {
          equals: testType,
        }
      }
    });
    
    if (!testTypeEntity) {
      return NextResponse.json([]);
    }
    
    // Get titles by aircraft and test type
    const titles = await prisma.title.findMany({
      where: {
        aircraftId: aircraftEntity.id,
        testTypeId: testTypeEntity.id
      },
      include: {
        tests: {
          where: { isActive: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format the response
    const formattedTitles = titles.map((title: {
      id: number;
      name: string;
      slug: string;
      aircraftId: number;
      testTypeId: number;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: title.id,
      name: title.name,
      slug: title.slug,
      aircraftId: title.aircraftId,
      testTypeId: title.testTypeId,
      createdAt: title.createdAt,
      updatedAt: title.updatedAt,
    }));
    
    return NextResponse.json(formattedTitles);
  } catch (error) {
    console.error('Error fetching titles:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching titles' },
      { status: 500 }
    );
  }
} 