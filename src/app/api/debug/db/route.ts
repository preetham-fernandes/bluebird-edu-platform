// Create this file: src/app/api/debug/db/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

interface Title {
  id: number;
  name: string;
  slug: string;
  aircraftId: number;
  testTypeId: number;
  createdAt: Date;
  updatedAt: Date;
  // Add any other properties that are relevant
}

export async function GET(request: NextRequest) {
  try {
    console.log('Starting comprehensive database debug...');
    
    // Get all data with relationships
    const aircraft = await prisma.aircraft.findMany();
    const testTypes = await prisma.testType.findMany();
    const titles = await prisma.title.findMany({
      include: {
        aircraft: true,
        testType: true,
        tests: {
          where: { isActive: true },
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });
    
    // Also get all tests separately to see what's there
    const allTests = await prisma.test.findMany({
      include: {
        questions: {
          include: {
            options: true
          }
        },
        titleRef: true
      }
    });
    
    const stats = {
      aircraftCount: aircraft.length,
      testTypeCount: testTypes.length,
      titleCount: titles.length,
      testCount: allTests.length,
      totalQuestions: allTests.reduce((sum, test) => sum + test.questions.length, 0)
    };
    
    const detailedData = {
      aircraft: aircraft.map(a => ({ 
        id: a.id, 
        name: a.name, 
        slug: a.slug 
      })),
      testTypes: testTypes.map(t => ({ 
        id: t.id, 
        type: t.type, 
        slug: t.slug 
      })),
      titles: titles.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        aircraftId: t.aircraftId,
        testTypeId: t.testTypeId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        aircraft: t.aircraft,
        testType: t.testType,
        testsCount: t.tests.length,
        tests: t.tests.map(test => ({
          id: test.id,
          title: test.title,
          isActive: test.isActive,
          questionCount: test.questions.length
        }))
      })),
      allTests: allTests.map(test => ({
        id: test.id,
        title: test.title,
        titleId: test.titleId,
        aircraftId: test.aircraftId,
        isActive: test.isActive,
        questionCount: test.questions.length,
        sampleQuestions: test.questions.slice(0, 2).map(q => ({
          id: q.id,
          questionNumber: q.questionNumber,
          questionText: q.questionText.substring(0, 100) + '...',
          optionCount: q.options.length
        }))
      }))
    };
    
    // Specific query for boeing-737-max + practice
    const aircraftEntity = await prisma.aircraft.findFirst({
      where: {
        OR: [
          { slug: 'boeing-737-max' },
          { name: { contains: 'Boeing 737 MAX' } }
        ]
      }
    });
    
    const testTypeEntity = await prisma.testType.findFirst({
      where: {
        OR: [
          { type: 'practice' },
          { slug: 'practice' }
        ]
      }
    });
    
    let matchingTitles: Title[] = [];
    if (aircraftEntity && testTypeEntity) {
      matchingTitles = await prisma.title.findMany({
        where: {
          aircraftId: aircraftEntity.id,
          testTypeId: testTypeEntity.id
        }
      });
    }
    
    console.log('Debug complete. Stats:', stats);
    
    return NextResponse.json({
      success: true,
      stats,
      data: detailedData,
      specificQuery: {
        aircraftEntity,
        testTypeEntity,
        matchingTitles
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}