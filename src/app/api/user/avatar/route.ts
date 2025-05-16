// src/app/api/user/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db/prisma';

// POST endpoint to update user avatar
export async function POST(request: NextRequest) {
  console.log('Avatar update API route called');
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    console.log('Session in avatar API:', session?.user?.email);
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      console.error('Authentication error: No session or user email');
      return NextResponse.json(
        { error: 'You must be signed in to update your avatar' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { avatarChoice } = body;
    
    // Validate avatar choice
    const validAvatars = ['air', 'water', 'fire', 'earth', 'spirit'];
    if (!avatarChoice || !validAvatars.includes(avatarChoice)) {
      console.error('Invalid avatar choice:', avatarChoice);
      return NextResponse.json(
        { error: 'Invalid avatar choice' },
        { status: 400 }
      );
    }
    
    // Find the user by email first to confirm they exist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      console.error('User not found with email:', session.user.email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`Updating avatar for user ${user.id} to ${avatarChoice}`);
    
    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarChoice },
      select: {
        id: true,
        name: true,
        email: true,
        avatarChoice: true
      }
    });
    
    console.log('User updated successfully:', updatedUser);
    
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