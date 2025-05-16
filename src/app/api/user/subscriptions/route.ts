// src/app/api/user/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch user's subscriptions
export async function GET() {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch user's subscriptions
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: true
      },
      orderBy: [
        { status: 'asc' },
        { endDate: 'desc' }
      ]
    });
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Subscribe to a plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    if (!body.planId || !body.duration) {
      return NextResponse.json(
        { error: 'Plan ID and duration are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: parseInt(body.planId) }
    });
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }
    
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    
    // Duration is in months
    if (body.duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (body.duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return NextResponse.json(
        { error: 'Invalid duration. Use "monthly" or "yearly"' },
        { status: 400 }
      );
    }
    
    // Create subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        startDate,
        endDate,
        status: 'active',
        paymentReference: 'direct_subscription_no_payment',
      }
    });
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}