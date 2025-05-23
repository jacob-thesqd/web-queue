import { NextRequest, NextResponse } from 'next/server';
import { getDropboxClient, getUploadPath, withRetry } from '@/lib/dropbox-client';
import { globalConfig } from '@/config/globalConfig';
import { logError } from '@/lib/debug-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    const offset = Number(formData.get('offset') as string);
    const totalSize = Number(formData.get('totalSize') as string);
    const fileName = formData.get('fileName') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get Dropbox client with token from vault
    let dbx;
    try {
      dbx = await getDropboxClient();
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to initialize Dropbox client', details: error.message },
        { status: 500 }
      );
    }
    
    const filePath = getUploadPath(fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Start a new upload session if no session ID is provided
    if (!sessionId) {
      try {
        const response = await withRetry(async () => {
          return await dbx.filesUploadSessionStart({
            close: false,
            contents: fileBuffer,
          });
        });
        
        return NextResponse.json({
          sessionId: response.result.session_id,
          offset: fileBuffer.length,
        });
      } catch (error: any) {
        logError('SESSION_START', error);
        return NextResponse.json(
          { 
            error: 'Upload failed', 
            details: error.message || 'Unknown error during session start',
            errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
          },
          { status: 500 }
        );
      }
    }
    
    // Append to an existing session
    if (sessionId && offset < totalSize) {
      const cursor = {
        session_id: sessionId,
        offset: offset,
      };

      // Check if this is the final chunk
      const isFinalChunk = offset + fileBuffer.length >= totalSize;
      
      try {
        if (isFinalChunk) {
          // Finish the session and commit the file
          const commitInfo = {
            path: filePath,
            mode: { '.tag': 'add' } as const,
            autorename: true,
            mute: false,
          };
          
          await withRetry(async () => {
            return await dbx.filesUploadSessionFinish({
              cursor,
              commit: commitInfo,
              contents: fileBuffer,
            });
          });
          
          return NextResponse.json({
            success: true,
            filePath,
            completed: true,
          });
        } else {
          // Append to the session
          await withRetry(async () => {
            return await dbx.filesUploadSessionAppendV2({
              cursor,
              close: false,
              contents: fileBuffer,
            });
          });
          
          return NextResponse.json({
            sessionId,
            offset: offset + fileBuffer.length,
          });
        }
      } catch (error: any) {
        logError(isFinalChunk ? 'SESSION_FINISH' : 'SESSION_APPEND', error);
        return NextResponse.json(
          { 
            error: 'Upload failed', 
            details: error.message || `Unknown error during ${isFinalChunk ? 'finish' : 'append'}`,
            errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ error: 'Invalid session parameters' }, { status: 400 });
    
  } catch (error: any) {
    logError('GENERAL_UPLOAD', error);
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error.message || 'Unknown error',
        errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 