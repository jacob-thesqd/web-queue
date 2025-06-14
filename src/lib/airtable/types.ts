// Centralized Airtable types based on the schema
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

export interface AirtableResponse<T = any> {
  records: T[];
  offset?: string;
}

export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
}

export interface AccountManagerData {
  account: number;
  account_manager_name: string;
  employee_email: string;
  profile_picture: string;
  am_calendly: string;
} 