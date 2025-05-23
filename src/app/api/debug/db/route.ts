// src/app/api/debug/db/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if Aircraft table exists and has data
    const aircraftCount = await prisma.aircraft.count();
    console.log(`✅ Found ${aircraftCount} aircraft records`);
    
    const aircraft = await prisma.aircraft.findMany();
    console.log('Aircraft records:', aircraft);

    // Check if TestType table exists and has data
    const testTypeCount = await prisma.testType.count();
    console.log(`✅ Found ${testTypeCount} test type records`);
    
    const testTypes = await prisma.testType.findMany();
    console.log('TestType records:', testTypes);

    // Check if Title table exists and has data
    const titleCount = await prisma.title.count();
    console.log(`✅ Found ${titleCount} title records`);
    
    const titles = await prisma.title.findMany({
      include: {
        aircraft: true,
        testType: true
      }
    });
    console.log('Title records with relations:', titles);

    // Test the specific query that's failing
    const aircraftSlug = 'boeing-737-max';
    const testTypeSlug = 'practice';
    
    console.log(`🔍 Looking for aircraft with slug: ${aircraftSlug}`);
    const aircraftEntity = await prisma.aircraft.findFirst({
      where: {
        OR: [
          { slug: aircraftSlug },
          { 
            name: {
              contains: aircraftSlug.split('-').join(' ')
            } 
          }
        ]
      }
    });
    console.log('Found aircraft:', aircraftEntity);

    console.log(`🔍 Looking for test type: ${testTypeSlug}`);
    const testTypeEntity = await prisma.testType.findFirst({
      where: {
        type: {
          equals: testTypeSlug
        }
      }
    });
    console.log('Found test type:', testTypeEntity);

    if (aircraftEntity && testTypeEntity) {
      console.log(`🔍 Looking for titles with aircraftId: ${aircraftEntity.id}, testTypeId: ${testTypeEntity.id}`);
      const matchingTitles = await prisma.title.findMany({
        where: {
          aircraftId: aircraftEntity.id,
          testTypeId: testTypeEntity.id
        },
        include: {
          tests: {
            where: { isActive: true }
          }
        }
      });
      console.log('Matching titles:', matchingTitles);
    }

    return NextResponse.json({
      success: true,
      stats: {
        aircraftCount,
        testTypeCount,
        titleCount
      },
      data: {
        aircraft,
        testTypes,
        titles: titles.slice(0, 5) // Limit to first 5 for brevity
      },
      specificQuery: {
        aircraftEntity,
        testTypeEntity,
        matchingTitles: aircraftEntity && testTypeEntity ? await prisma.title.findMany({
          where: {
            aircraftId: aircraftEntity.id,
            testTypeId: testTypeEntity.id
          }
        }) : null
      }
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}