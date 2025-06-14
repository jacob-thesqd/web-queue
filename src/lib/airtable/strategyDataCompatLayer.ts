import { StrategyMemberData } from '../supabase/getStrategyMemberData';
import { UseAirtableAccountData } from '@/hooks/useAirtableAccount';
import { AccountManagerData } from './types';

/**
 * Converts Airtable account data to the StrategyMemberData format
 * This provides a compatibility layer to ease the transition from Supabase to Airtable
 */
export function convertAirtableToStrategyData(airtableData: UseAirtableAccountData): StrategyMemberData | null {
  if (!airtableData.accountData) {
    return null;
  }

  return {
    id: airtableData.accountData?.id || '',
    account: airtableData.memberNumber || 0,
    church_name: airtableData.churchName || '',
    queue_num: airtableData.queueNumber || 0,
    address: airtableData.accountData?.fields?.['Address'] || '',
    website: airtableData.accountData?.fields?.['Website'] || '',
    brand_guide: airtableData.markupLink || '',
    discovery_call: airtableData.discoveryFormSubmissionId || '',
    status: airtableData.accountData?.fields?.['Status'] || '',
    primary_email: [],
    wb_products: airtableData.accountData?.fields?.['Products'] ? 
      [airtableData.accountData.fields['Products']].flat() : 
      [],
    wb_type: airtableData.accountData?.fields?.['Type'] || '',
    url: airtableData.accountData?.fields?.['Web URL'] || '',
  };
}

/**
 * Ensures a URL is a valid Calendly URL
 * If it doesn't contain calendly.com, return empty string
 */
function formatCalendlyUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Trim and ensure it's a string
  const cleanUrl = String(url).trim();
  
  // Check if it's a valid URL with calendly in it
  if (!cleanUrl || !cleanUrl.includes('calendly')) {
    return '';
  }
  
  // Ensure URL has a protocol
  if (!cleanUrl.startsWith('http')) {
    // If it's just a username like "josh-smith", format as proper Calendly URL
    if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
      return `https://calendly.com/${cleanUrl}`;
    }
    // Otherwise add https protocol
    return `https://${cleanUrl}`;
  }
  
  return cleanUrl;
}

/**
 * Extracts account manager data from an Airtable record
 * Used as a fallback when the Supabase account manager lookup fails
 */
export function extractAccountManagerFromAirtable(
  record: { fields: Record<string, string | number | boolean | null | undefined> } | null, 
  accountNumber: number
): AccountManagerData | null {
  if (!record || !record.fields) {
    return null;
  }
  
  const cssRep = record.fields['CSS Rep (Strategy)'] as string | undefined;
  
  if (!cssRep) {
    return null;
  }
  
  // Get Calendly link from Airtable if available
  const calendlyField = record.fields['Calendly Check-In (Strategy)'] as string | null | undefined;
  const calendlyLink = formatCalendlyUrl(calendlyField);
  
  return {
    account: accountNumber,
    account_manager_name: cssRep,
    employee_email: '',
    profile_picture: '',
    am_calendly: calendlyLink,
  };
} 