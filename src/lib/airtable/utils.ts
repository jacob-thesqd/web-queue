// Centralized Airtable utilities
import Airtable from 'airtable';
import { AIRTABLE_CONFIG, validateAirtableConfig } from './config';
import { AirtableTaskTemplate, MilestoneStep } from './types';

// Initialize Airtable with configuration
function getAirtableBase() {
  if (!validateAirtableConfig()) {
    throw new Error('Airtable configuration is invalid');
  }

  const airtable = new Airtable({ 
    apiKey: AIRTABLE_CONFIG.API_KEY 
  });
  
  return airtable.base(AIRTABLE_CONFIG.BASE_ID);
}

/**
 * Fetches task templates from Airtable and transforms them into milestone steps
 * This function should be used server-side only due to API key security
 */
export async function fetchTaskTemplates(): Promise<MilestoneStep[]> {
  try {
    if (!validateAirtableConfig()) {
      console.warn('AIRTABLE_API_KEY not provided, using fallback data');
      return getFallbackSteps();
    }

    const base = getAirtableBase();
    const records = await base(AIRTABLE_CONFIG.TABLE_NAME)
      .select({
        view: AIRTABLE_CONFIG.VIEW_ID,
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
    if (!validateAirtableConfig()) {
      return null;
    }

    const base = getAirtableBase();
    const record = await base(AIRTABLE_CONFIG.TABLE_NAME).find(recordId);
    
    return {
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
    };
  } catch (err) {
    console.error('Error fetching task template by ID:', err);
    return null;
  }
} 