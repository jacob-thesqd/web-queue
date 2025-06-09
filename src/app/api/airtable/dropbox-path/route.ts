import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberNumber = searchParams.get('memberNumber');

    if (!memberNumber) {
      return NextResponse.json(
        { error: 'Member number is required' },
        { status: 400 }
      );
    }

    // Use environment variables for direct Airtable API call
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo'; // Same table as queue number
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const filterFormula = `{Member #} = ${memberNumber}`;
    
    const response = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    const searchResults = data.records || [];

    // Check if we found any records
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.log(`📭 No records found for member ${memberNumber}`);
      return NextResponse.json({ dropboxPath: null });
    }

    // Get the first matching record
    const record = searchResults[0];
    const dropboxPath = record.fields && record.fields['Dropbox Folder Church Root'] 
      ? record.fields['Dropbox Folder Church Root'] 
      : null;

    return NextResponse.json({ dropboxPath });
  } catch (error) {
    console.error('❌ Error fetching dropbox path from Airtable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dropbox path', dropboxPath: null },
      { status: 500 }
    );
  }
} 