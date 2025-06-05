// Airtable API service for managing task templates and milestone data
import Airtable from 'airtable';

// Types based on the Airtable schema
export interface AirtableTaskTemplate {
  id: string;
  createdTime: string;
  fields: {
    "Task ID": string;
    "Name": string;
    "Department": string[];
    "Estimate": number;
    "All-In Phase": string[];
    "Owner": string[];
  };
}

export interface MilestoneStep {
  step: number;
  title: string;
  description: string;
  estimate?: number;
  owner?: string[];
  phase?: string[];
}

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appjHSW7sGtitxoHf';
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || '🔑 Task Templates';
const AIRTABLE_VIEW_ID = process.env.AIRTABLE_VIEW_ID || 'viw0EnaZ5lOsNqWXR';

// Initialize Airtable
if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY not found in environment variables');
}

const airtable = new Airtable({ 
  apiKey: AIRTABLE_API_KEY 
});
const base = airtable.base(AIRTABLE_BASE_ID);

/**
 * Fetches task templates from Airtable and transforms them into milestone steps
 * This function should be used server-side only due to API key security
 */
export async function fetchTaskTemplates(): Promise<MilestoneStep[]> {
  try {
    if (!AIRTABLE_API_KEY) {
      console.warn('AIRTABLE_API_KEY not provided, using fallback data');
      return getFallbackSteps();
    }

    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        view: AIRTABLE_VIEW_ID,
        sort: [{ field: 'Task ID', direction: 'asc' }]
      })
      .all();

    const taskTemplates: AirtableTaskTemplate[] = records.map(record => ({
      id: record.id,
      createdTime: record.get('createdTime') as string || new Date().toISOString(),
      fields: {
        "Task ID": record.get('Task ID') as string || '',
        "Name": record.get('Name') as string || '',
        "Department": record.get('Department') as string[] || [],
        "Estimate": record.get('Estimate') as number || 0,
        "All-In Phase": record.get('All-In Phase') as string[] || [],
        "Owner": record.get('Owner') as string[] || []
      }
    }));

    return transformTaskTemplatesToSteps(taskTemplates);
  } catch (err) {
    console.error('Error fetching task templates from Airtable:', err);
    return getFallbackSteps();
  }
}

/**
 * Fallback data when Airtable is unavailable
 */
function getFallbackSteps(): MilestoneStep[] {
  return [
    {
      step: 1,
      title: "Approve Active Queue Spot",
      description: "Estimated time: 10 minutes | Owner: Web Strategist",
      estimate: 10,
      owner: ["Web Strategist"]
    },
    {
      step: 2,
      title: "Review Content Collection",
      description: "Estimated time: 60 minutes | Owner: Web Strategist", 
      estimate: 60,
      owner: ["Web Strategist"]
    },
    {
      step: 3,
      title: "Review Strategy Brief & Approve Web Scope",
      description: "Estimated time: 60 minutes | Owner: Web Strategist",
      estimate: 60,
      owner: ["Web Strategist"]
    }
  ];
}

/**
 * Transforms Airtable task template data into milestone steps format
 */
function transformTaskTemplatesToSteps(templates: AirtableTaskTemplate[]): MilestoneStep[] {
  return templates.map((template, index) => ({
    step: index + 1,
    title: template.fields.Name,
    description: `Estimated time: ${template.fields.Estimate} minutes | Owner: ${template.fields.Owner.join(', ')}`,
    estimate: template.fields.Estimate,
    owner: template.fields.Owner,
    phase: template.fields["All-In Phase"]
  }));
}

/**
 * Fetches a specific task template by ID
 */
export async function fetchTaskTemplateById(recordId: string): Promise<AirtableTaskTemplate | null> {
  try {
    return null;
  } catch (err) {
    console.error('Error fetching task template by ID:', err);
    return null;
  }
}

/**
 * Configuration object for Airtable service
 */
export const airtableConfig = {
  baseId: AIRTABLE_BASE_ID,
  tableName: AIRTABLE_TABLE_NAME,
  viewId: AIRTABLE_VIEW_ID,
}; 