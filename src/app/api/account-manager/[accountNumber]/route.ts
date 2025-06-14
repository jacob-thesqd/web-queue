import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface AccountManagerData {
  account: number;
  account_manager_name: string;
  employee_email: string;
  profile_picture: string;
  am_calendly: string;
}

interface AirtableRecord {
  id: string;
  fields: {
    'CSS Rep'?: string;
    'Account Manager'?: string;
    'CSS Rep Email'?: string;
    'Email'?: string;
    'CSS Rep Profile Picture'?: string;
    'Profile Picture'?: string;
    'CSS Rep Calendly'?: string;
    'Calendly'?: string;
    [key: string]: unknown;
  };
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

// Helper function to extract account manager data from Airtable record
function extractAccountManagerFromAirtable(record: AirtableRecord, accountNumber: number): AccountManagerData | null {
  try {
    const fields = record.fields;
    
    // Extract the account manager data from Airtable fields
    // Note: Field names may need adjustment based on actual Airtable schema
    const accountManagerData: AccountManagerData = {
      account: accountNumber,
      account_manager_name: fields['CSS Rep'] || fields['Account Manager'] || '',
      employee_email: fields['CSS Rep Email'] || fields['Email'] || '',
      profile_picture: fields['CSS Rep Profile Picture'] || fields['Profile Picture'] || '',
      am_calendly: fields['CSS Rep Calendly'] || fields['Calendly'] || ''
    };
    
    // Return null if essential fields are missing
    if (!accountManagerData.account_manager_name) {
      return null;
    }
    
    return accountManagerData;
  } catch (error) {
    console.error('Error extracting account manager data from Airtable:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  try {
    const { accountNumber: accountNumberStr } = await params;
    const accountNumber = parseInt(accountNumberStr);
    
    if (isNaN(accountNumber)) {
      return NextResponse.json(
        { error: 'Invalid account number' },
        { status: 400 }
      );
    }

    // Check if we should force using the Airtable fallback
    const searchParams = request.nextUrl.searchParams;
    const forceFallback = searchParams.get('forceFallback') === 'true';
    // Only try Supabase if we're not forcing fallback
    //let supabaseData = null;
    let supabaseError = null;
    
    if (!forceFallback) {
      const { data, error } = await supabase
        .rpc('get_account_manager_profile_pictures', { 
          account_number: accountNumber 
        });
      
      //supabaseData = data;
      supabaseError = error;
      
      // Return Supabase data if available
      if (!error && data) {
        // Set cache headers for client-side caching
        const response = NextResponse.json({ 
          data: data || [],
          source: 'supabase' 
        });
        response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes cache
        
        return response;
      }
    }

    // Use error from Supabase result or create one if forced fallback
    const errorMessage = supabaseError 
      ? `Error fetching account manager data from Supabase: ${supabaseError.message}`
      : forceFallback 
        ? 'Forced fallback to Airtable' 
        : 'Unknown error';
    
    console.log(forceFallback ? '🔄 Forced fallback to Airtable' : errorMessage);
    
    // Fallback to Airtable if Supabase call fails or forced fallback
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo';
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const filterFormula = `{Member #} = ${accountNumber}`;
    
    const airtableResponse = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!airtableResponse.ok) {
      throw new Error(`Airtable API call failed: ${airtableResponse.statusText}`);
    }

    const airtableData: AirtableResponse = await airtableResponse.json();
    const searchResults = airtableData.records || [];

    // Check if we found any records
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.log('⚠️ No Airtable records found for account:', accountNumber);
      return NextResponse.json(
        { error: 'Account manager data not found' },
        { status: 404 }
      );
    }

    // Get the first matching record and extract account manager data
    const record = searchResults[0];
    const accountManagerData = extractAccountManagerFromAirtable(record, accountNumber);
    
    if (!accountManagerData) {
      console.log('⚠️ CSS Rep not found in Airtable for account:', accountNumber);
      return NextResponse.json(
        { error: 'Account manager not found in Airtable' },
        { status: 404 }
      );
    }
    
    console.log('✅ Using Airtable data for account manager:', {
      account: accountNumber,
      name: accountManagerData.account_manager_name,
      hasCalendlyLink: !!accountManagerData.am_calendly
    });
    
    // Set cache headers for client-side caching
    const fallbackResponse = NextResponse.json({ 
      data: [accountManagerData],
      source: 'airtable'
    });
    fallbackResponse.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes cache
    
    return fallbackResponse;
  } catch (err) {
    console.error('Unexpected error in account manager API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 