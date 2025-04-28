// src/app/api/user/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// POST endpoint to update user avatar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be signed in to update your avatar' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { avatarChoice } = body;
    
    // Validate avatar choice
    const validAvatars = ['air', 'water', 'fire', 'earth', 'spirit'];
    if (!avatarChoice || !validAvatars.includes(avatarChoice)) {
      return NextResponse.json(
        { error: 'Invalid avatar choice' },
        { status: 400 }
      );
    }
    
    // Update user avatar in database
    const userId = parseInt(session.user.id);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarChoice },
      select: {
        id: true,
        name: true,
        email: true,
        avatarChoice: true
      }
    });
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating your avatar' },
      { status: 500 }
    );
  }
}