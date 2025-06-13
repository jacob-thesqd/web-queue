import { NextRequest, NextResponse } from 'next/server';
import { fetchTaskTemplates } from '@/lib/airtable/utils';

export async function GET(request: NextRequest) {
  try {
    const steps = await fetchTaskTemplates();
    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching task templates from Airtable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task templates' },
      { status: 500 }
    );
  }
} 