import AvatarComponent from '@/components/ui/comp-412';
import { useAccountManagerProfile } from '@/hooks/useAccountManagerProfile';
import CalendlyDialog from '@/components/ui/CalendlyDialog';
import { PersonStanding } from "lucide-react";
import { globalConfig } from '@/config/globalConfig';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useEffect } from 'react';

interface AccountManagerProps {
  accountNumber: number;
  shouldShow?: boolean;
}

/**
 * Ensures a URL is a valid Calendly URL
 */
function ensureValidCalendlyUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Trim and ensure it's a string
  const cleanUrl = String(url).trim();
  
  // Check if it's a valid URL with calendly in it
  if (!cleanUrl || !cleanUrl.includes('calendly')) {
    return '';
  }
  
  // Ensure URL has a protocol
  if (!cleanUrl.startsWith('http')) {
    // If it's just a username like "josh-smith", format as proper Calendly URL
    if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
      return `https://calendly.com/${cleanUrl}`;
    }
    // Otherwise add https protocol
    return `https://${cleanUrl}`;
  }
  
  return cleanUrl;
}

export default function AccountManager({ accountNumber, shouldShow = true }: AccountManagerProps) {
  const { data: accountManagerData, loading, error } = useAccountManagerProfile(accountNumber);
  const { markComponentLoaded, markComponentError } = useLoading();

  // Integrate with loading system
  useEffect(() => {
    if (!loading) {
      if (error) {
        markComponentError('account-manager', error);
      } else {
        markComponentLoaded('account-manager');
      }
    }
  }, [loading, error, markComponentLoaded, markComponentError]);

  // Don't render if shouldShow is false
  if (!shouldShow) {
    return null;
  }

  // Hide component entirely if there's an error, still loading, or no account manager data
  if (error || loading || !accountManagerData?.account_manager_name) {
    return null;
  }

  // Create display JSX based on account manager data
  const getDisplayContent = () => {
    return (
      <>
        Account Manager: <strong className="text-foreground font-medium">{accountManagerData.account_manager_name}</strong>
      </>
    );
  };

  // Use profile picture from Supabase if available, otherwise use fallback
  const profilePictures = accountManagerData?.profile_picture 
    ? [accountManagerData.profile_picture]
    : [<PersonStanding className="w-5 h-5" key="fallback-profile" />];

  // Get the calendly URL from the account manager data
  const calendlyUrl = accountManagerData?.am_calendly ? ensureValidCalendlyUrl(accountManagerData.am_calendly) : '';
  const hasValidCalendlyUrl = calendlyUrl && calendlyUrl.length > 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <AvatarComponent 
          variant={globalConfig.components.avatarVariant}
          profilePictures={profilePictures}
          displayContent={getDisplayContent()}
        />
      </div>
      {accountManagerData?.account_manager_name && hasValidCalendlyUrl && (
        <CalendlyDialog calendlyUrl={calendlyUrl} />
      )}
    </div>
  );
}