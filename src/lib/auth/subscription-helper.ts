// src/lib/auth/subscription-helper.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * Helper to check if a user has an active subscription
 */
export async function checkUserSubscription(userId: number): Promise<{
  hasSubscription: boolean;
  error?: NextResponse;
}> {
  try {
    // Get current date
    const now = new Date();
    
    // Check if user has any active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: {
          gt: now
        }
      }
    });
    
    return { 
      hasSubscription: !!subscription
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasSubscription: false,
      error: NextResponse.json(
        { error: 'Error checking subscription status' },
        { status: 500 }
      )
    };
  }
}