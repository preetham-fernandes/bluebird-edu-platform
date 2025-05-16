// src/app/api/tests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aircraft = searchParams.get('aircraft');
    const title = searchParams.get('title');
    const testType = searchParams.get('testType');
    
    if (!aircraft || !title) {
      return NextResponse.json(
        { error: 'Aircraft and title parameters are required' },
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
    
    // Find the test type if provided
    let testTypeEntity = null;
    if (testType) {
      testTypeEntity = await prisma.testType.findFirst({
        where: {
          type: {
            equals: testType,
            // mode: 'insensitive'
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
            //   mode: 'insensitive'
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
    const formattedTests = tests.map(test => ({
      id: test.id,
      title: test.title,
      subject: test.titleRef?.name || '',
      totalQuestions: test.totalQuestions || test.questions.length,
      timeLimit: test.timeLimit
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