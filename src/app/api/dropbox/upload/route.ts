import { NextRequest, NextResponse } from 'next/server';
import { getUploadPath } from '@/lib/dropbox-client';
import { getDropboxAccessToken } from '@/lib/supabase/vault';
import { logError } from '@/lib/debug-utils';
import { globalConfig } from '@/config/globalConfig';

// Helper function to get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to fetch dropbox path from Airtable using our generic account API
async function fetchDropboxPathFromAirtable(accountNumber: number): Promise<string | null> {
  try {
    console.log('🔍 Fetching dropbox path via account API for:', accountNumber);
    
    // Use our generic account API internally
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo';
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records (same as our generic API)
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const filterFormula = `{Member #} = ${accountNumber}`;
    
    const response = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.log('❌ Airtable API response not OK:', response.status, response.statusText);
      throw new Error(`Airtable API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    const searchResults = data.records || [];
    console.log('- Found', searchResults.length, 'records for upload');

    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.log(`📭 No records found for member ${accountNumber}`);
      return null;
    }

    const record = searchResults[0];
    const dropboxPath = record.fields && record.fields['Dropbox Folder Church Root'] 
      ? record.fields['Dropbox Folder Church Root'] 
      : null;
      
    console.log('- Dropbox Path found for upload:', dropboxPath);

    return dropboxPath;
  } catch (error) {
    console.error('❌ Error fetching dropbox path for upload:', error);
    return null;
  }
}

// Direct implementation without relying on the Dropbox SDK
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    
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

    // Determine the base path
    let basePath: string;
    
    console.log('🔍 Upload Debug Info:');
    console.log('- Account Number:', accountNumber);
    console.log('- Account Number Type:', typeof accountNumber);
    
    if (accountNumber) {
      console.log('📁 Using dynamic path from Airtable for account:', accountNumber);
      // For social media uploads - use dynamic path from Airtable
      const airtableBasePath = await fetchDropboxPathFromAirtable(parseInt(accountNumber));
      console.log('- Airtable Base Path:', airtableBasePath);
      
      if (airtableBasePath) {
        // Construct the social media upload path using config settings
        const todaysDate = getTodaysDate();
        const targetSubfolder = globalConfig.socialMediaUploader.targetSubfolder;
        basePath = globalConfig.socialMediaUploader.autoDateFolder 
          ? `${airtableBasePath}/${targetSubfolder}/${todaysDate}`
          : `${airtableBasePath}/${targetSubfolder}`;
        console.log('- Final Upload Path:', basePath);
      } else {
        console.log('❌ No Airtable path found for account:', accountNumber);
        
        if (globalConfig.socialMediaUploader.fallbackToGlobalPath) {
          console.log('📁 Using fallback to global path as configured');
          basePath = globalConfig.dropbox.productionPath;
        } else {
          // Return error if we can't get client-specific path for social media uploads
          return NextResponse.json(
            { error: `Could not find Dropbox folder configuration for account ${accountNumber}. Please ensure the account exists in Airtable with a valid "Dropbox Folder Church Root" field.` },
            { status: 400 }
          );
        }
      }
    } else {
      console.log('📁 Using global config path (no account number provided)');
      // For regular uploads - use global config path
      basePath = globalConfig.dropbox.productionPath;
      console.log('- Global Config Path:', basePath);
    }
    
    // Create clean ASCII-only path for Dropbox API
    const cleanFileName = fileName.replace(/[^\x00-\x7F]/g, "_"); // Replace non-ASCII with underscore
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