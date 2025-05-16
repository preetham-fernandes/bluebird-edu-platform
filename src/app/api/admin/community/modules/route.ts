// src/app/api/admin/community/modules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch all modules with thread counts
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Fetch all modules (aircraft in your system)
    const modules = await prisma.aircraft.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            // Count messages that are threads for this module
            communityMessages: {
              where: {
                isThread: true,
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    
    // Format response with thread counts
    const formattedModules = modules.map((module) => ({
      id: module.id,
      name: module.name,
      slug: module.slug,
      threadCount: module._count.communityMessages,
    }));
    
    return NextResponse.json(formattedModules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

// POST - Create a new module
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, slug } = body;
    
    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }
    
    // Check if slug is already in use
    const existingModule = await prisma.aircraft.findUnique({
      where: { slug },
    });
    
    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this slug already exists' },
        { status: 409 }
      );
    }
    
    // Create the module
    const newModule = await prisma.aircraft.create({
      data: {
        name,
        slug,
      },
    });
    
    return NextResponse.json(newModule);
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}