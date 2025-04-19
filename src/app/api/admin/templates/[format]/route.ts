// src/app/api/admin/templates/[format]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleTemplateDownload } from '@/lib/fileProcessing/templateGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { format: string } }
) {
  try {
    const { format } = params;
    
    // Validate the requested format
    if (!['csv', 'xlsx', 'txt'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid template format requested' },
        { status: 400 }
      );
    }
    
    // Get the template data and metadata
    const templateInfo = handleTemplateDownload(format as 'csv' | 'xlsx' | 'txt');
    
    // Create the response with appropriate headers
    const response = new NextResponse(
      format === 'xlsx' 
        ? Buffer.from(templateInfo.data as ArrayBuffer)
        : templateInfo.data as string
    );
    
    // Set headers
    response.headers.set('Content-Type', templateInfo.contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${templateInfo.filename}"`);
    
    return response;
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the template' },
      { status: 500 }
    );
  }
}