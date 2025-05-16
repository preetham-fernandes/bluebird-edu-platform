// src/app/api/admin/community/subjects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db/prisma';

// GET - Fetch a specific subject by ID
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
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }
    
    // Fetch subject
    const subject = await prisma.title.findUnique({
      where: { id },
      include: {
        aircraft: true,
        _count: {
          select: {
            CommunityMessage: {
              where: {
                isThread: true,
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Format response
    const formattedSubject = {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      moduleId: subject.aircraftId,
      moduleName: subject.aircraft.name,
      threadCount: subject._count.CommunityMessage,
    };
    
    return NextResponse.json(formattedSubject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject' },
      { status: 500 }
    );
  }
}

// PUT - Update a subject
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
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, slug, moduleId } = body;
    
    // Validate required fields
    if (!name || !slug || !moduleId) {
      return NextResponse.json(
        { error: 'Name, slug, and moduleId are required' },
        { status: 400 }
      );
    }
    
    // Check if subject exists
    const existingSubject = await prisma.title.findUnique({
      where: { id },
    });
    
    if (!existingSubject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Check if module exists
    const module = await prisma.aircraft.findUnique({
      where: { id: moduleId },
    });
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Check if slug is already in use by another subject in the same module
    const slugExists = await prisma.title.findFirst({
      where: {
        slug,
        aircraftId: moduleId,
        id: { not: id },
      },
    });
    
    if (slugExists) {
      return NextResponse.json(
        { error: 'A different subject with this slug already exists in this module' },
        { status: 409 }
      );
    }
    
    // Update the subject
    const updatedSubject = await prisma.title.update({
      where: { id },
      data: {
        name,
        slug,
        aircraftId: moduleId,
      },
      include: {
        aircraft: true,
      },
    });
    
    // Format response
    const formattedSubject = {
      id: updatedSubject.id,
      name: updatedSubject.name,
      slug: updatedSubject.slug,
      moduleId: updatedSubject.aircraftId,
      moduleName: updatedSubject.aircraft.name,
    };
    
    return NextResponse.json(formattedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subject and all related content
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
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }
    
    // Check if subject exists
    const existingSubject = await prisma.title.findUnique({
      where: { id },
    });
    
    if (!existingSubject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Start a transaction to delete related data
    await prisma.$transaction(async (tx) => {
      // 1. Delete community messages related to this subject
      await tx.communityMessage.deleteMany({
        where: { subjectId: id },
      });
      
      // 2. Delete the subject itself
      await tx.title.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}