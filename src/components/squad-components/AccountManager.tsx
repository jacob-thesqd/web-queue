import AvatarComponent from '@/components/ui/comp-412';
import { useAccountManagerData } from '@/hooks/useAccountManagerData';
import { Skeleton } from "@/components/ui/skeleton";
import CalendlyDialog from '@/components/ui/CalendlyDialog';
import { PersonStanding } from "lucide-react";

interface AccountManagerProps {
  accountNumber: number;
}

export default function AccountManager({ accountNumber }: AccountManagerProps) {
  const { data, loading, error } = useAccountManagerData(accountNumber);

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="bg-background flex items-center rounded-full border p-1 shadow-sm">
        <div className="flex -space-x-1.5">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="rounded-full h-5 w-5" />
          ))}
        </div>
        <Skeleton className="h-3 w-36 ml-2" />
      </div>
    );
  }

  // Extract profile pictures and account manager names
  const profilePictures = data
    .filter(item => item.profile_picture)
    .map(item => item.profile_picture);
  
  const accountManagerNames = data
    .map(item => item.account_manager_name)
    .filter(Boolean);

  // Extract calendly URL (use the first available one)
  const calendlyUrl = data
    .find(item => item.am_calendly)?.am_calendly || "https://www.google.com";

  console.log('Account Manager Data:', data);
  console.log('Calendly URL:', calendlyUrl);

  // Create display JSX based on account managers
  const getDisplayContent = () => {
    if (error) return "Error loading account managers";
    if (accountManagerNames.length === 0) return "No account managers found";
    
    if (accountManagerNames.length === 1) {
      return (
        <>
          Account Manager: <strong className="text-foreground font-medium">{accountManagerNames[0]}</strong>
        </>
      );
    } else {
      const lastManager = accountManagerNames.pop();
      return (
        <>
          Account Managers: <strong className="text-foreground font-medium">{accountManagerNames.join(', ')}</strong> and <strong className="text-foreground font-medium">{lastManager}</strong>
        </>
      );
    }
  };

  // Use fallback profile pictures if none are available
  const fallbackPictures = [
    <PersonStanding className="w-5 h-5" />,
  ];

  return (
    <div className="flex items-center gap-4">
    <AvatarComponent 
      profilePictures={profilePictures.length > 0 ? profilePictures : fallbackPictures}
      displayContent={getDisplayContent()}
    />
    <CalendlyDialog calendlyUrl={calendlyUrl} />
    </div>
  );
}