// Replace your existing src/app/api/titles/route.ts with this enhanced version:
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TITLES API DEBUG START ===');
    
    const searchParams = request.nextUrl.searchParams;
    const aircraft = searchParams.get('aircraft');
    const testType = searchParams.get('testType');
    
    console.log('Received params:', { aircraft, testType });
    
    if (!aircraft || !testType) {
      console.log('Missing required parameters');
      return NextResponse.json(
        { error: 'Aircraft and test type parameters are required' },
        { status: 400 }
      );
    }
    
    // Test database connection first
    console.log('Testing database connection...');
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', connectionTest);
    
    // Find the aircraft by slug or name
    console.log('Looking for aircraft with search term:', aircraft);
    const aircraftSearchTerm = aircraft.split('-').join(' ');
    console.log('Aircraft search term after processing:', aircraftSearchTerm);
    
    const allAircraft = await prisma.aircraft.findMany();
    console.log('All aircraft in database:', allAircraft);
    
    const aircraftEntity = await prisma.aircraft.findFirst({
      where: {
        OR: [
          { slug: aircraft },
          { slug: { contains: aircraft } },
          { name: { contains: aircraftSearchTerm } },
          { name: { contains: aircraft } }
        ]
      }
    });
    
    console.log('Found aircraft entity:', aircraftEntity);
    
    if (!aircraftEntity) {
      console.log('No aircraft found, returning empty array');
      return NextResponse.json([]);
    }
    
    // Find the test type by type
    console.log('Looking for test type:', testType);
    const allTestTypes = await prisma.testType.findMany();
    console.log('All test types in database:', allTestTypes);
    
    const testTypeEntity = await prisma.testType.findFirst({
      where: {
        OR: [
          { type: testType },
          { type: { contains: testType } },
          { slug: testType },
          { slug: { contains: testType } }
        ]
      }
    });
    
    console.log('Found test type entity:', testTypeEntity);
    
    if (!testTypeEntity) {
      console.log('No test type found, returning empty array');
      return NextResponse.json([]);
    }
    
    // Get titles by aircraft and test type
    console.log('Looking for titles with aircraftId:', aircraftEntity.id, 'and testTypeId:', testTypeEntity.id);
    
    const allTitles = await prisma.title.findMany({
      where: {
        aircraftId: aircraftEntity.id,
        testTypeId: testTypeEntity.id
      }
    });
    console.log('All matching titles (before including tests):', allTitles);
    
    const titles = await prisma.title.findMany({
      where: {
        aircraftId: aircraftEntity.id,
        testTypeId: testTypeEntity.id
      },
      include: {
        tests: {
          where: { isActive: true },
          include: {
            questions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('Titles with tests:', titles.map(t => ({
      id: t.id,
      name: t.name,
      testsCount: t.tests.length,
      tests: t.tests.map(test => ({
        id: test.id,
        title: test.title,
        questionCount: test.questions.length,
        isActive: test.isActive
      }))
    })));
    
    // Format the response
    const formattedTitles = titles.map(title => ({
      id: title.id,
      name: title.name,
      slug: title.slug,
      testCount: title.tests.length
    }));
    
    console.log('Final formatted response:', formattedTitles);
    console.log('=== TITLES API DEBUG END ===');
    
    return NextResponse.json(formattedTitles);
  } catch (error) {
    console.error('Error in titles API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'An error occurred while fetching titles',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}