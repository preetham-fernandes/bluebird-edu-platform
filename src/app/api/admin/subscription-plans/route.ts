// src/app/api/admin/subscription-plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET - Fetch all subscription plans
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: [
        { moduleType: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.displayName || !body.moduleType || 
        body.moduleId === undefined || body.priceMonthly === undefined || 
        body.priceYearly === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        description: body.description || null,
        moduleType: body.moduleType,
        moduleId: parseInt(body.moduleId),
        priceMonthly: parseFloat(body.priceMonthly),
        priceYearly: parseFloat(body.priceYearly),
        features: body.features || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      }
    });
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}