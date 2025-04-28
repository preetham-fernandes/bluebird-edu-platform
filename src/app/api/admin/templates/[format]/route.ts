// src/app/api/admin/templates/[format]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleTemplateDownload } from '@/lib/fileProcessing/templateGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { format: string } }
) {
  try {
    const { format } = params;
    
    // Only support txt format now
    if (format !== 'txt') {
      return NextResponse.json(
        { error: 'Invalid template format requested. Only txt format is supported.' },
        { status: 400 }
      );
    }
    
    // Get the template data and metadata
    const templateInfo = handleTemplateDownload(format);
    
    // Create the response with appropriate headers
    const response = new NextResponse(templateInfo.data as string);
    
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