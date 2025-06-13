// Centralized Airtable configuration to eliminate code duplication
export const AIRTABLE_CONFIG = {
  BASE_ID: process.env.AIRTABLE_BASE_ID || 'appjHSW7sGtitxoHf',
  TABLE_NAME: process.env.AIRTABLE_TABLE_NAME || '🔑 Task Templates',
  VIEW_ID: process.env.AIRTABLE_VIEW_ID || 'viw0EnaZ5lOsNqWXR',
  API_KEY: process.env.AIRTABLE_API_KEY,
} as const;

export const AIRTABLE_HEADERS = {
  'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
  'Content-Type': 'application/json',
} as const;

export function validateAirtableConfig(): boolean {
  if (!AIRTABLE_CONFIG.API_KEY) {
    console.warn('AIRTABLE_API_KEY not found in environment variables');
    return false;
  }
  return true;
} 