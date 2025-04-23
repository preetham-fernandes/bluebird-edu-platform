// src/app/api/admin/aircraft/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as aircraftService from '@/lib/services/aircraftService';

// GET endpoint to retrieve all aircraft
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    
    if (slug) {
      // Get a specific aircraft by slug
      const aircraft = await aircraftService.getAircraftBySlug(slug);
      
      if (!aircraft) {
        return NextResponse.json(
          { error: 'Aircraft not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(aircraft);
    }
    
    // Get all aircraft
    const aircraft = await aircraftService.getAllAircraft();
    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new aircraft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const aircraft = await aircraftService.createAircraft({
      name,
      slug
    });

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error creating aircraft:', error);
    return NextResponse.json(
      { error: 'Failed to create aircraft' },
      { status: 500 }
    );
  }
}