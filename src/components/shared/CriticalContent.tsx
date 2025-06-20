// Server component for immediate rendering of critical content
import { globalConfig } from "@/config/globalConfig";

interface CriticalContentProps {
  isLoading?: boolean;
  departmentError?: string | null;
  hasVisibleCards?: boolean;
  department?: string | null;
}

export function CriticalContent({ 
  isLoading = false, 
  departmentError = null, 
  hasVisibleCards = true, 
  department = null 
}: CriticalContentProps) {
  // Loading state handled by loading overlay - no need for skeleton placeholders
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 bg-transparent max-w-4xl">
        {/* Loading overlay handles all loading states - no skeleton needed */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 bg-transparent max-w-4xl">
      {/* Show error message if department filtering is enabled but there's an error */}
      {globalConfig.components.airtableDepartmentFiltering && departmentError && (
        <div className="text-center text-red-500 py-8">
          <p>Error loading department data: {departmentError}</p>
        </div>
      )}

      {/* Critical LCP content - renders immediately */}
      {globalConfig.components.airtableDepartmentFiltering && !hasVisibleCards && !departmentError && (
        <div className="text-center text-gray-500 py-8">
          <p>Nothing to see here yet...</p>
          {department && <p className="text-sm mt-2">Department: {department}</p>}
        </div>
      )}
    </div>
  );
} 