// src/app/api/admin/aircraft-list/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const aircraft = await prisma.aircraft.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    if (!aircraft) {
      return NextResponse.json({ error: 'No aircraft found' }, { status: 404 });
    }
    
    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}