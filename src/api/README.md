# API Services

## Airtable Integration

The Airtable service provides integration with the "🔑 Task Templates" table in Airtable base `appjHSW7sGtitxoHf` using the official Airtable JavaScript SDK.

### Prerequisites

1. **Install Airtable SDK**: `npm install airtable`
2. **Environment Variables**: Add your Airtable credentials to `.env.local`

### Environment Setup

Add the following to your `.env.local` file:

```env
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=appjHSW7sGtitxoHf
AIRTABLE_TABLE_NAME=🔑 Task Templates
AIRTABLE_VIEW_ID=viw0EnaZ5lOsNqWXR
```

To get your API key:
1. Go to [Airtable Account](https://airtable.com/create/tokens)
2. Create a new personal access token
3. Grant access to your base and the required scopes (data.records:read)

### Usage

#### Basic Component Usage

```tsx
import MilestoneStepperComponent from '@/components/ui/comp-525';

// Use with Airtable data (automatic fetching)
<MilestoneStepperComponent 
  useAirtable={true}
  mode="list"
  currentStep={2}
/>

// Use with manual data (traditional approach)
<MilestoneStepperComponent 
  useAirtable={false}
  steps={[
    { step: 1, title: "Custom Step", description: "Manual data" }
  ]}
  currentStep={1}
/>
```

#### Using the Hook Directly

```tsx
import { useTaskTemplates } from '@/hooks/useTaskTemplates';

function MyComponent() {
  const { steps, loading, error, refetch } = useTaskTemplates();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {steps.map(step => (
        <div key={step.step}>{step.title}</div>
      ))}
    </div>
  );
}
```

#### API Endpoint

The `/api/airtable/task-templates` endpoint provides server-side access to the Airtable data using the official Airtable SDK. This ensures API keys are kept secure on the server.

### Configuration

Enable/disable the Airtable integration in `src/config/globalConfig.ts`:

```tsx
export const globalConfig = {
  components: {
    airtableMilestoneStepper: true // Set to false to disable
  }
};
```

### Data Structure

The Airtable table schema includes:
- **Task ID**: Unique identifier
- **Name**: Task name (displayed as step title)
- **Department**: Task department(s)
- **Estimate**: Time estimate in minutes
- **All-In Phase**: Project phase(s)
- **Owner**: Responsible team member(s)

### Error Handling

The service includes:
- Automatic fallback to default data if Airtable is unavailable
- Loading states during data fetching
- Error display when data cannot be loaded
- Retry functionality via the `refetch` method 