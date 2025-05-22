import { Dropbox } from 'dropbox';
import { globalConfig } from '@/config/globalConfig';
// Import isomorphic-fetch for universal fetch support
import 'isomorphic-fetch';

// Initialize Dropbox client with app key
export const getDropboxClient = () => {
  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('Dropbox access token is not configured');
  }
  
  // Using isomorphic-fetch, we don't need to provide fetch implementation
  return new Dropbox({ 
    accessToken
  });
};

/**
 * Sanitize a string to make it safe for use in HTTP headers
 * Replaces non-ASCII characters with underscores
 */
export const sanitizeForHeader = (str: string): string => {
  // Replace non-ASCII characters and potentially problematic Unicode punctuation/symbols
  return str.replace(/[^\x00-\x7F]/g, "_")
    .replace(/[\u2000-\u206F\u2E00-\u2E7F]/g, "_"); // Unicode punctuation and symbols
};

// Determine upload path based on devMode setting
export const getUploadPath = (fileName: string) => {
  const basePath = globalConfig.dropbox.devMode 
    ? globalConfig.dropbox.devModeDBPath 
    : globalConfig.dropbox.productionPath;
  
  // Clean the filename to make it ASCII-safe
  const safeFileName = sanitizeForHeader(fileName);
  
  return `${basePath}/${safeFileName}`;
};

// Helper function for retry logic
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = globalConfig.dropbox.maxRetries,
  retryDelay = 1000
): Promise<T> => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      console.log('Error in withRetry:', error);
      
      // Check if it's a 409 "too_many_write_operations" error
      if (
        error?.status === 409 &&
        error?.error?.error?.['.tag'] === 'too_many_write_operations' &&
        retries < maxRetries
      ) {
        retries++;
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, retries - 1);
        console.log(`Dropbox 409 error, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}; 