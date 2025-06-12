import { NextRequest, NextResponse } from 'next/server';
import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';

/**
 * Handles GET requests to fetch strategy member data
 * This endpoint now fetches data from Airtable instead of Supabase
 */
export async function GET(request: NextRequest) {
  // Get account ID from query params
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('account');

  if (!accountId) {
    return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
  }

  try {
    // Use Airtable API instead of Supabase
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo';
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const filterFormula = `{Member #} = ${accountId}`;
    
    const response = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API call failed: ${response.statusText}`);
    }

    const airtableData = await response.json();
    const records = airtableData.records || [];

    // Check if we found any records
    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ 
        message: `No strategy member found for account: ${accountId}`,
        data: null
      }, { status: 404 });
    }

    // Get the first matching record
    const record = records[0];
    
    // Convert to StrategyMemberData format
    const data: StrategyMemberData = {
      id: record.id,
      account: parseInt(accountId),
      church_name: record.fields['Church Name'] || '',
      queue_num: record.fields['Queue Number'] || 0,
      address: record.fields['Address'] || '',
      website: record.fields['Website'] || '',
      brand_guide: record.fields['Markup Link'] || '',
      discovery_call: record.fields['Discovery Form Submission ID'] || '',
      status: record.fields['Status'] || '',
      primary_email: record.fields['Primary Email'] ? [record.fields['Primary Email']] : [],
      wb_products: record.fields['Products'] ? [record.fields['Products']].flat() : [],
      wb_type: record.fields['Type'] || '',
      url: record.fields['Web URL'] || '',
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Unexpected error fetching strategy member data:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 