// src/app/api/community/messages/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as reportService from '@/lib/services/community/reportService';

// POST - Report a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to report messages' },
        { status: 401 }
      );
    }
    
    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { reason, details } = body;
    
    // Create report
    const report = await reportService.createReport(
      messageId,
      parseInt(session.user.id),
      reason,
      details
    );
    
    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      id: report.id
    });
  } catch (error) {
    console.error('Error reporting message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to report message' },
      { status: 500 }
    );
  }
}