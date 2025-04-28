// src/app/api/community/terms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET endpoint to check if user has accepted terms
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Debug the session to see what we're working with
    console.log("Session in terms API:", JSON.stringify(session, null, 2));
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { hasAccepted: false, error: 'Not authenticated' },
        { status: 200 } // Return 200 with hasAccepted: false
      );
    }
    
    // Get user ID from the session - handle both cases
    const userId = session.user.id;
    
    // If we still don't have a user ID, try to find the user by email
    let user;
    if (userId) {
      // Find by ID if available
      user = await prisma.user.findUnique({
        where: { 
          id: parseInt(userId) 
        },
        select: { communityTermsAccepted: true }
      });
    } else if (session.user.email) {
      // Fallback to finding by email
      user = await prisma.user.findUnique({
        where: { 
          email: session.user.email 
        },
        select: { communityTermsAccepted: true }
      });
    }
    
    const hasAccepted = user?.communityTermsAccepted || false;
    
    return NextResponse.json({ hasAccepted });
  } catch (error) {
    console.error('Error checking terms acceptance:', error);
    return NextResponse.json(
      { hasAccepted: false, error: 'An error occurred' },
      { status: 200 }
    );
  }
}

// POST endpoint to accept terms
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to accept terms' },
        { status: 401 }
      );
    }
    
    // Get user ID from the session or find by email
    let user;
    const userId = session.user.id;
    
    if (userId) {
      // Update by ID if available
      user = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { communityTermsAccepted: true }
      });
    } else if (session.user.email) {
      // Fallback to updating by email
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: { communityTermsAccepted: true }
      });
    } else {
      throw new Error("Cannot identify user");
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting terms:', error);
    return NextResponse.json(
      { error: 'An error occurred while accepting terms' },
      { status: 500 }
    );
  }
}