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


    
    // Fallback approach using environment variables for direct Airtable API call
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo';
    
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
      return NextResponse.json({ queueNumber: null });
    }

    // Get the first matching record
    const record = searchResults[0];
    const queueNumber = record.fields && record.fields['Queue Number'] ? record.fields['Queue Number'] : null;

    return NextResponse.json({ queueNumber });
  } catch (error) {
    console.error('❌ Error fetching queue number from Airtable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue number', queueNumber: null },
      { status: 500 }
    );
  }
} 