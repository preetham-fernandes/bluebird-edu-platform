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
      { error: 'An error occurred while fetching aircraft' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new aircraft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Aircraft name and type are required' },
        { status: 400 }
      );
    }
    
    // Create new aircraft
    const aircraft = await aircraftService.createAircraft({
      name: body.name,
      type: body.type,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });
    
    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Error creating aircraft:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the aircraft' },
      { status: 500 }
    );
  }
}