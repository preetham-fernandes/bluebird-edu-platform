// src/app/api/titles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aircraft = searchParams.get('aircraft');
    const testType = searchParams.get('testType');
    
    if (!aircraft || !testType) {
      return NextResponse.json(
        { error: 'Aircraft and test type parameters are required' },
        { status: 400 }
      );
    }
    
    // Find the aircraft by slug or name
    const aircraftEntity = await prisma.aircraft.findFirst({
      where: {
        OR: [
          { slug: aircraft },
          { 
            name: {
              contains: aircraft.split('-').join(' '), 
            //   mode: 'insensitive'
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
        //   mode: 'insensitive'
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
    const formattedTitles = titles.map(title => ({
      id: title.id,
      name: title.name,
      slug: title.slug,
      testCount: title.tests.length
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