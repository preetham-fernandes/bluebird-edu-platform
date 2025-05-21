// src/app/api/community/messages/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session-helper';
import * as reportService from '@/lib/services/community/reportService';

// POST - Report a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const { userId, error } = await getAuthenticatedUserId(request);
    
    // Return error if authentication failed
    if (error) return error;
    
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

    // Check if userId is defined
    if (userId === undefined) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Create report
    const report = await reportService.createReport(
      messageId,
      userId,
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