import { useAirtableAccount } from '@/hooks/useAirtableAccount';
import { getDepartmentCardVisibility } from '@/lib/departmentUtils';
import { globalConfig } from '@/config/globalConfig';

interface DepartmentDebugInfoProps {
  accountNumber?: number;
  showDebug?: boolean;
}

/**
 * Debug component to visualize department filtering logic
 * Only shows when showDebug is true
 */
export default function DepartmentDebugInfo({ accountNumber, showDebug = false }: DepartmentDebugInfoProps) {
  const { department, loading, error } = useAirtableAccount(
    globalConfig.components.airtableDepartmentFiltering ? accountNumber : undefined
  );

  if (!showDebug || !globalConfig.components.airtableDepartmentFiltering) {
    return null;
  }

  const cardVisibility = getDepartmentCardVisibility(department);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Department Debug Info</h3>
      <div className="space-y-1">
        <p><strong>Account:</strong> {accountNumber || 'N/A'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        {error && <p className="text-red-300"><strong>Error:</strong> {error}</p>}
        <p><strong>Department:</strong> {department || 'None'}</p>
        
        <div className="mt-2">
          <p className="font-bold">Card Visibility:</p>
          <p>• Web Card: {cardVisibility.showWebCard ? '✓' : '✗'}</p>
          <p>• Brand Card: {cardVisibility.showBrandCard ? '✓' : '✗'}</p>
          <p>• SM Card: {cardVisibility.showSMCard ? '✓' : '✗'}</p>
        </div>

        <div className="mt-2 text-gray-300">
          <p className="text-[10px]">Rules:</p>
          <p className="text-[10px]">• "All-In" → Show all cards</p>
          <p className="text-[10px]">• "Strategy" → Show all cards</p>
          <p className="text-[10px]">• "Social" (no "Strategy") → SM Card</p>
          <p className="text-[10px]">• "Brand" (no "All-In") → Brand Card</p>
          <p className="text-[10px]">• "Web" (no "All-In") → Web Card</p>
        </div>
      </div>
    </div>
  );
} 