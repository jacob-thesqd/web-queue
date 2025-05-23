import { NextRequest, NextResponse } from 'next/server';
import { getUploadPath } from '@/lib/dropbox-client';
import { getDropboxAccessToken } from '@/lib/supabase/vault';
import { logError } from '@/lib/debug-utils';
import { globalConfig } from '@/config/globalConfig';

// Direct implementation without relying on the Dropbox SDK
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get access token from Supabase vault
    let accessToken: string;
    try {
      accessToken = await getDropboxAccessToken();
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to get Dropbox token from vault', details: error.message },
        { status: 500 }
      );
    }

    // Get path and ensure it's properly encoded for Dropbox
    const rawPath = getUploadPath(fileName);
    
    // Create clean ASCII-only path for Dropbox API
    const cleanFileName = fileName.replace(/[^\x00-\x7F]/g, "_"); // Replace non-ASCII with underscore
    const basePath = globalConfig.dropbox.devMode 
      ? globalConfig.dropbox.devModeDBPath 
      : globalConfig.dropbox.productionPath;
    const cleanPath = `${basePath}/${cleanFileName}`.replace(/[\u2000-\u206F\u2E00-\u2E7F]/g, "_");
    
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Directly use fetch API to upload to Dropbox with sanitized path
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: cleanPath,
          mode: 'add',
          autorename: true,
          mute: false,
        }),
        'Dropbox-API-Select-User': 'dbmid:AABo4fq2X3uLimFPIIKWuPS3arV4l31_8fk',
        'Dropbox-API-Path-Root':'{".tag": "root", "root": "2564080211"}'
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // If the response is not valid JSON, use the raw text
        errorData = { error_summary: errorText };
      }
      
      logError('DIRECT_UPLOAD', errorData);
      return NextResponse.json(
        { 
          error: 'Upload failed', 
          details: errorData.error_summary || 'Error from Dropbox API',
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      filePath: data.path_display,
      completed: true,
    });
    
  } catch (error: any) {
    logError('DIRECT_UPLOAD_GENERAL', error);
    
    // Return a properly formatted JSON response
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
} 