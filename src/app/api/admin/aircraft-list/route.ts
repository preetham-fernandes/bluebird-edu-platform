// src/app/api/admin/aircraft-list/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

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
    
    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft' },
      { status: 500 }
    );
  }
}