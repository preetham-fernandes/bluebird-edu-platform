// src/app/api/admin/test-types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET endpoint to retrieve all test types
export async function GET(request: NextRequest) {
  try {
    // Get all test types
    const testTypes = await prisma.testType.findMany({
      orderBy: {
        type: 'asc',
      },
    });
    
    return NextResponse.json(testTypes);
  } catch (error) {
    console.error('Error fetching test types:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching test types' },
      { status: 500 }
    );
  }
}

// Note: We don't provide a POST endpoint for test types
// as they are predefined and not user-creatable according to requirements