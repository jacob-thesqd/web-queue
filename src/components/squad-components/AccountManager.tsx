import AvatarComponent from '@/components/ui/comp-412';
import { useAccountManagerData } from '@/hooks/useAccountManagerData';
import CalendlyDialog from '@/components/ui/CalendlyDialog';
import { PersonStanding } from "lucide-react";
import { useEffect } from 'react';
import { globalConfig } from '@/config/globalConfig';

interface AccountManagerProps {
  accountNumber: number;
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

export default function AccountManager({ accountNumber }: AccountManagerProps) {
  const { data, loading, error, dataSource } = useAccountManagerData(accountNumber);

  // Extract profile pictures and account manager names
  const profilePictures = data
    .filter(item => item.profile_picture)
    .map(item => item.profile_picture);
  
  const accountManagerNames = data
    .map(item => item.account_manager_name)
    .filter(Boolean);

  // Extract calendly URL (use the first available one)
  // Filter out empty strings, undefined, or URLs that don't contain "calendly"
  const calendlyUrls = data
    .map(item => ensureValidCalendlyUrl(item.am_calendly))
    .filter(url => url && url.trim().length > 0);
  
  const calendlyUrl = calendlyUrls[0] || '';
  
  // Debug log for Calendly URLs - Must be called unconditionally
  useEffect(() => {
    if (!loading) {
      console.log('AccountManager component info:', {
        accountNumber,
        dataSource,
        hasCalendlyUrl: !!calendlyUrl,
        calendlyUrl,
        rawCalendlyUrls: data.map(item => item.am_calendly),
        filteredCalendlyUrls: calendlyUrls
      });
    }
  }, [data, dataSource, accountNumber, calendlyUrl, calendlyUrls, loading]);
{/*
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
  } */}
    

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
    <PersonStanding className="w-5 h-5" key="fallback-profile" />,
  ];

  // Only render the Calendly button if we have a valid URL
  const hasValidCalendlyUrl = calendlyUrl && calendlyUrl.length > 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <AvatarComponent 
          variant={globalConfig.components.avatarVariant}
          profilePictures={profilePictures.length > 0 ? profilePictures : fallbackPictures}
          displayContent={getDisplayContent()}
        />
      </div>
      {accountManagerNames.length > 0 && hasValidCalendlyUrl && (
        <CalendlyDialog calendlyUrl={calendlyUrl} />
      )}
    </div>
  );
}