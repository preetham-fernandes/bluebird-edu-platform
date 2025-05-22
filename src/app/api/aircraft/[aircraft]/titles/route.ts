import { NextRequest, NextResponse } from 'next/server';
import * as titleService from '@/lib/services/titleService';

// GET endpoint to retrieve all titles/subjects for an aircraft
export async function GET(
  request: NextRequest,
  { params }: { params: { aircraft: string } }
) {
  try {
    const { aircraft } = params;
    
    // Format aircraft slug to get name
    const aircraftName = aircraft
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const titles = await titleService.getTitlesByAircraftName(aircraftName);
    
    return NextResponse.json(titles);
  } catch (error) {
    console.error('Error fetching titles:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching titles' },
      { status: 500 }
    );
  }
} 