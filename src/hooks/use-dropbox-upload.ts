import { useState, useCallback } from 'react';
import { globalConfig } from '@/config/globalConfig';

interface UploadProgress {
  [fileId: string]: {
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
  };
}

interface UploadOptions {
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, filePath: string) => void;
  onError?: (fileId: string, error: string) => void;
  accountNumber?: number; // Optional account number for social media uploads
}

export const useDropboxUpload = (options?: UploadOptions) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

  const uploadToDropbox = useCallback(
    async (fileId: string, file: File) => {
      // Update progress state to start
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: { progress: 0, status: 'uploading' },
      }));

      try {
        // For small files, use the direct upload endpoint
        if (file.size <= 150 * 1024 * 1024) { // 150MB limit for direct upload
          const formData = new FormData();
          formData.append('file', file);
          
          // Create a safe file name for HTTP headers
          const fileName = file.name;
          formData.append('fileName', fileName);
          
          // Add account number if provided (for social media uploads)
          console.log('🔍 Upload Hook Debug:');
          console.log('- Options account number:', options?.accountNumber);
          console.log('- Will append account number:', !!options?.accountNumber);
          
          if (options?.accountNumber) {
            formData.append('accountNumber', options.accountNumber.toString());
            console.log('- Account number appended to form data:', options.accountNumber.toString());
          } else {
            console.log('- No account number provided to upload hook');
          }

          // Set up upload with progress tracking
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              
              // Update progress state
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: { progress, status: 'uploading' },
              }));
              
              // Call progress callback if provided
              if (options?.onProgress) {
                options.onProgress(fileId, progress);
              }
            }
          });
          
          // Create a promise to handle the XHR response
          const uploadPromise = new Promise<string>((resolve, reject) => {
            xhr.onload = function() {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  if (response.success) {
                    resolve(response.filePath);
                  } else {
                    reject(new Error(response.details || 'Upload failed'));
                  }
                } catch (error) {
                  reject(new Error('Invalid response from server'));
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.details || `HTTP error ${xhr.status}`));
                } catch (parseError) {
                  // If the response is not valid JSON, use the raw text
                  reject(new Error(`HTTP error ${xhr.status}: ${xhr.responseText.substring(0, 100)}`));
                }
              }
            };
            
            xhr.onerror = function() {
              reject(new Error('Network error during upload'));
            };
          });
          
          // Send the request
          xhr.open('POST', '/api/dropbox/upload');
          xhr.send(formData);
          
          // Wait for the upload to complete
          const filePath = await uploadPromise;
          
          // Update completed state
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { progress: 100, status: 'completed' },
          }));
          
          // Call complete callback if provided
          if (options?.onComplete) {
            options.onComplete(fileId, filePath);
          }
          
          return filePath;
        } else {
          // For larger files, we would need chunked upload - but for now just throw an error
          throw new Error('Files larger than 150MB are not supported yet');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        
        // Update error state
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { 
            progress: prev[fileId]?.progress || 0, 
            status: 'error',
            error: error.message || 'Unknown error'
          },
        }));

        // Call error callback if provided
        if (options?.onError) {
          options.onError(fileId, error.message || 'Unknown error');
        }
        
        throw error;
      }
    },
    [options]
  );

  return {
    uploadProgress,
    uploadToDropbox,
  };
}; 