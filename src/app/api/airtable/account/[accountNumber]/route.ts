import { NextRequest, NextResponse } from 'next/server';

export interface AirtableAccountData {
  id: string;
  fields: {
    'Member #'?: number;
    'Queue Number'?: number;
    'Dropbox Folder Church Root'?: string;
    'Church Name'?: string;
    [key: string]: any; // Allow for additional fields
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  try {
    const { accountNumber } = await params;

    if (!accountNumber) {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching account data for:', accountNumber);

    // Use environment variables for direct Airtable API call
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const baseId = 'appjHSW7sGtitxoHf';
    const tableId = 'tblAIXogbNPuIRMOo';
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const filterFormula = `{Member #} = ${accountNumber}`;
    
    console.log('- Filter Formula:', filterFormula);
    
    const response = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.log('❌ Airtable API response not OK:', response.status, response.statusText);
      throw new Error(`Airtable API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    const searchResults = data.records || [];

    console.log('- Found', searchResults.length, 'records');

    // Check if we found any records
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.log(`📭 No records found for member ${accountNumber}`);
      return NextResponse.json({ 
        accountData: null,
        error: `No account found for member number ${accountNumber}`
      }, { status: 404 });
    }

    // Get the first matching record with all its fields
    const record = searchResults[0];
    const accountData: AirtableAccountData = {
      id: record.id,
      fields: record.fields || {}
    };

    console.log('- Account data found:', {
      memberId: accountData.fields['Member #'],
      queueNumber: accountData.fields['Queue Number'],
      dropboxPath: accountData.fields['Dropbox Folder Church Root'],
      churchName: accountData.fields['Church Name'],
      markupLink: accountData.fields['Markup Link'],
      discoveryFormSubmissionId: accountData.fields['Discovery Form Submission ID']
    });

    return NextResponse.json({ 
      accountData,
      queueNumber: accountData.fields['Queue Number'],
      dropboxPath: accountData.fields['Dropbox Folder Church Root'],
      churchName: accountData.fields['Church Name'],
      markupLink: accountData.fields['Markup Link'],
      discoveryFormSubmissionId: accountData.fields['Discovery Form Submission ID']
    });
  } catch (error) {
    console.error('❌ Error fetching account data from Airtable:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch account data', 
        accountData: null,
        queueNumber: null,
        dropboxPath: null 
      },
      { status: 500 }
    );
  }
} 