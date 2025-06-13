import { NextRequest, NextResponse } from 'next/server';

export interface AirtableAccountData {
  id: string;
  fields: {
    'Member #'?: number;
    'Queue Number'?: number;
    'Dropbox Folder Church Root'?: string;
    'Church Name'?: string;
    'Department (Plain Text)'?: string;
    'Sunday Photos This Week'?: number;
    [key: string]: any; // Allow for additional fields
  };
}

// Helper function to find department from multiple possible field names
function findDepartment(record: any): { department: string | null; usedFieldName: string | null } {
  const possibleDepartmentFields = [
    'Department (Plain Text)',
    'Department',
    'Dept',
    'Squad',
    'Team',
    'Department (from Strategy Squad Members)'
  ];
  
  let department = null;
  let usedFieldName = null;
  
  for (const fieldName of possibleDepartmentFields) {
    if (record.fields && record.fields[fieldName]) {
      department = record.fields[fieldName];
      usedFieldName = fieldName;
      break;
    }
  }
  
  return { department, usedFieldName };
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

    // Extract department information
    const { department, usedFieldName } = findDepartment(record);
    
    // Extract Sunday photos status
    const sundayPhotosValue = record.fields && record.fields['Sunday Photos This Week'] ? record.fields['Sunday Photos This Week'] : 0;
    const sundayPhotosUploaded = sundayPhotosValue === 1;

    return NextResponse.json({ 
      accountData,
      queueNumber: accountData.fields['Queue Number'],
      dropboxPath: accountData.fields['Dropbox Folder Church Root'],
      churchName: accountData.fields['Church Name'],
      markupLink: accountData.fields['Markup Link'],
      discoveryFormSubmissionId: accountData.fields['Discovery Form Submission ID'],
      contentSnareLink: accountData.fields['ContentSnare Link'],
      loomVideoFolder: accountData.fields['Loom Link'],
      // Department data
      department,
      usedFieldName,
      availableFields: Object.keys(record.fields || {}),
      // Sunday photos data
      sundayPhotosUploaded,
      sundayPhotosValue,
      memberNumber: parseInt(accountNumber)
    });
  } catch (error) {
    console.error('❌ Error fetching comprehensive account data from Airtable:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch account data', 
        accountData: null,
        queueNumber: null,
        dropboxPath: null,
        department: null,
        loomVideoFolder: null,
        sundayPhotosUploaded: false
      },
      { status: 500 }
    );
  }
} 