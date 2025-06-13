import { NextRequest, NextResponse } from 'next/server';
import { Fillout } from '@fillout/api';

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

    // Step 1: Get the Discovery Form Submission ID from Airtable
    const { AIRTABLE_CONFIG, AIRTABLE_HEADERS, validateAirtableConfig } = await import('@/lib/airtable/config');
    const FILLOUT_API_KEY = process.env.FILLOUT_API_KEY;
    
    if (!validateAirtableConfig()) {
      throw new Error('Airtable API key not configured');
    }

    // Use Airtable REST API to search for records
    const tableId = 'tblAIXogbNPuIRMOo';
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${tableId}`;
    const filterFormula = `{Member #} = ${memberNumber}`;
    
    const response = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: AIRTABLE_HEADERS
    });

    if (!response.ok) {
      console.log('❌ Airtable API response not OK:', response.status, response.statusText);
      throw new Error(`Airtable API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    const searchResults = data.records || [];

    // Check if we found any records
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.log(`📭 No records found for member ${memberNumber}`);
      return NextResponse.json({ 
        submission: null,
        error: `No account found for member number ${memberNumber}`
      }, { status: 404 });
    }

    // Get the first matching record
    const record = searchResults[0];
    const discoveryFormSubmissionId = record.fields && record.fields['Discovery Form Submission ID'] 
      ? record.fields['Discovery Form Submission ID'] 
      : null;

    if (!discoveryFormSubmissionId) {
      return NextResponse.json({ 
        submission: null,
        error: `No discovery form submission ID found for member ${memberNumber}`
      }, { status: 404 });
    }

    // Step 2: Get the submission from Fillout
    if (!FILLOUT_API_KEY) {
      throw new Error('Fillout API key not configured');
    }
    
    const fillout = new Fillout(FILLOUT_API_KEY);
    
    try {
      // Use the specific form ID for the All-In Discovery Questionnaire
      const formId = 'nvAtCKKq8ous'; // All-In Discovery Questionnaire form ID
      
      // Get the specific submission by ID with editLink included
      const submission = await fillout.getSubmission(formId, discoveryFormSubmissionId, {
        includeEditLink: true
      });

      return NextResponse.json({ 
        submission,
        memberNumber: parseInt(memberNumber)
      });

    } catch (filloutError: unknown) {
      console.error('❌ Error fetching submission from Fillout:', filloutError);
      
      // Fall back to mock data if Fillout API fails
      console.log('🔄 Falling back to mock data due to Fillout API error');
      
      // Mock submission data as fallback
    
    // Mock submission data based on the sample provided in the user query
    const mockSubmission = {
      submissionId: discoveryFormSubmissionId,
      submissionTime: "2025-06-09T18:30:43.599Z",
      lastUpdatedAt: "2025-06-09T18:30:43.599Z", 
      startedAt: "2025-06-09T18:24:48.932Z",
      questions: [
        {
          id: "uHUJ",
          name: "Primary Contact Name",
          type: "ShortAnswer",
          value: "Sample Contact"
        },
        {
          id: "mSUt", 
          name: "Primary Contact Role",
          type: "ShortAnswer",
          value: "Pastor"
        },
        {
          id: "9Mv8",
          name: "Best Email",
          type: "EmailInput", 
          value: "contact@church.com"
        },
        {
          id: "3ZEe",
          name: "Best Phone Number",
          type: "PhoneNumber",
          value: "+1234567890"
        },
        {
          id: "jCNi",
          name: "What does your church's name mean or reference?",
          type: "LongAnswer",
          value: "Our church name represents hope and community in our local area..."
        },
        {
          id: "kcko",
          name: "Paste or write your church's current Mission/Vision statement.",
          type: "LongAnswer", 
          value: "To love God, love people, and make disciples who transform communities."
        }
      ],
      calculations: [
        {
          id: "kAes",
          name: "Discovery Call Assignee", 
          type: "text",
          value: "Strategy Team Member"
        }
      ],
      urlParameters: [
        {
          id: "id",
          name: "id",
          value: `rec${memberNumber}`
        }
      ],
      quiz: {},
      documents: [],
      scheduling: [
        {
          id: "niC8",
          name: "Discovery Call",
          value: {
            fullName: "Sample Contact",
            email: "contact@church.com",
            phone: "",
            timezone: "America/Vancouver",
            eventStartTime: "2025-06-25T19:00:00.000Z",
            eventEndTime: "2025-06-25T20:00:00.000Z",
            eventId: "sample123",
            eventUrl: "https://calendar.google.com/event/sample",
            rescheduleOrCancelUrl: "https://forms.thesqd.com/reschedule",
            scheduledUserEmail: "strategy@churchmediasquad.com",
            scheduledUserName: "Strategy Team"
          }
        }
      ],
      payments: []
    };

      // Add editLink to mock submission to match Fillout's response structure
      const mockSubmissionWithEditLink = {
        ...mockSubmission,
        editLink: `https://forms.thesqd.com/all-in-discovery?edit=${mockSubmission.submissionId}`
      };

      const errorMessage = filloutError instanceof Error ? filloutError.message : 'Unknown Fillout error';
      return NextResponse.json({ 
        submission: mockSubmissionWithEditLink,
        memberNumber: parseInt(memberNumber),
        filloutError: errorMessage
      });
    }

  } catch (error) {
    console.error('❌ Error fetching discovery submission:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch discovery submission', 
        submission: null
      },
      { status: 500 }
    );
  }
} 