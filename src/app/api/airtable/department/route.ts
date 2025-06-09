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

    // Use the same Airtable configuration as the working queue-number endpoint
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
      return NextResponse.json({ department: null });
    }

    // Get the first matching record
    const record = searchResults[0];
    
    // Debug: Log all available fields to help identify the correct field name
    console.log(`🔍 Available fields for member ${memberNumber}:`, Object.keys(record.fields || {}));
    console.log(`📊 Full record fields:`, record.fields);
    
    // Try multiple possible field names for department
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

    console.log(`📋 Found department for member ${memberNumber} using field "${usedFieldName}":`, department);

    return NextResponse.json({ 
      department,
      usedFieldName,
      availableFields: Object.keys(record.fields || {})
    });
  } catch (error) {
    console.error('❌ Error fetching department from Airtable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department', department: null },
      { status: 500 }
    );
  }
} 