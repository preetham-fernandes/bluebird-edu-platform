// src/app/api/admin/community/modules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch a specific module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid module ID' },
        { status: 400 }
      );
    }
    
    // Fetch module
    const module = await prisma.aircraft.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            CommunityMessages: {
              where: {
                isThread: true,
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Format response
    const formattedModule = {
      id: module.id,
      name: module.name,
      slug: module.slug,
      threadCount: module._count.CommunityMessage,
    };
    
    return NextResponse.json(formattedModule);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

// PUT - Update a module
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid module ID' },
        { status: 400 }
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
    
    // Check if module exists
    const existingModule = await prisma.aircraft.findUnique({
      where: { id },
    });
    
    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Check if slug is already in use by another module
    const slugExists = await prisma.aircraft.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });
    
    if (slugExists) {
      return NextResponse.json(
        { error: 'A different module with this slug already exists' },
        { status: 409 }
      );
    }
    
    // Update the module
    const updatedModule = await prisma.aircraft.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });
    
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a module and all related content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid module ID' },
        { status: 400 }
      );
    }
    
    // Check if module exists
    const existingModule = await prisma.aircraft.findUnique({
      where: { id },
    });
    
    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Start a transaction to delete related data
    await prisma.$transaction(async (tx) => {
      // 1. Delete community messages related to this module
      await tx.communityMessage.deleteMany({
        where: { moduleId: id },
      });
      
      // 2. Delete the module itself
      await tx.aircraft.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}