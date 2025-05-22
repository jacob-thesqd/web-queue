/**
 * Debug utility for structured error logging
 */

export const logError = (context: string, error: any) => {
  console.error(`[${context}] Error:`, {
    message: error.message || 'Unknown error',
    status: error.status,
    code: error.code,
    name: error.name,
    stack: error.stack,
    details: error.error || error.details || error,
  });
};

export const debugLog = (enabled: boolean, ...args: any[]) => {
  if (enabled || process.env.DEBUG === 'true') {
    console.log(...args);
  }
}; 