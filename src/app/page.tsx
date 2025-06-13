"use client";

import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useEffect, useState, Suspense, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, Easing } from "framer-motion";
import { fadeInVariants } from "@/lib/animation-variants";
import { useStrategyData } from "@/hooks/use-strategy-data";
import { useLayout } from "@/hooks/use-layout";
import { useAirtableAccount } from "@/hooks/useAirtableAccount";
import { getDepartmentCardVisibility, hasVisibleCards, countVisibleCards } from "@/lib/departmentUtils";
import { globalConfig } from "@/config/globalConfig";
import { useLoading } from "@/components/providers/LoadingProvider";
import { CardLoadingWrapper } from "@/components/ui/card-loading-wrapper";

// Critical above-the-fold components - load immediately
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { AnimatedGroup } from "@/components/ui/animated-group";
import AccountManager from "@/components/squad-components/AccountManager";
import SettingsComponent from "@/components/shared/Settings";
import ApiCacheDebug from "@/components/shared/ApiCacheDebug";

// Non-critical components - lazy load with SSR
const WebCard = dynamic(() => import("@/components/dept-cards/WebCard"), {
  ssr: true
});

const SMCard = dynamic(() => import("@/components/dept-cards/SMCard"), {
  ssr: true
});

const BrandCard = dynamic(() => import("@/components/dept-cards/BrandCard"), {
  ssr: true
});

// Immediate content component that renders synchronously
function ImmediateContent() {
  return (
    <div className="text-center text-gray-500 py-8">
    </div>
  );
}

// Throttle function for scroll events
const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  return (...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

function HomeContent() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account") || undefined;
  const { data: strategyMemberData, loading } = useStrategyData(accountId);
  const { effectiveLayout } = useLayout();
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isClientReady, setIsClientReady] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Loading system integration
  const { 
    registerComponent, 
    markComponentLoaded, 
    markComponentError,
    isAppLoading
  } = useLoading();

  // Register main page components for loading tracking
  useEffect(() => {
    registerComponent('home-content');
    registerComponent('strategy-data');
    registerComponent('account-data');
    registerComponent('page-layout');
    
    return () => {
      // Components will be automatically unregistered by the provider
    };
  }, [registerComponent]);

  // Immediately set client ready to render content ASAP
  useEffect(() => {
    setIsClientReady(true);
    markComponentLoaded('home-content');
  }, [markComponentLoaded]);

  // Fetch comprehensive account data (includes department and all other data) - but don't block rendering
  const { department, loading: accountLoading, error: accountError } = useAirtableAccount(
    globalConfig.components.airtableDepartmentFiltering && strategyMemberData?.account ? 
      strategyMemberData.account : undefined
  );

  // Track strategy data loading
  useEffect(() => {
    if (!loading && strategyMemberData) {
      markComponentLoaded('strategy-data');
    } else if (!loading && !strategyMemberData) {
      markComponentError('strategy-data', 'No strategy data available');
    }
  }, [loading, strategyMemberData, markComponentLoaded, markComponentError]);

  // Track account data loading
  useEffect(() => {
    if (!accountLoading) {
      if (accountError) {
        markComponentError('account-data', accountError);
      } else {
        markComponentLoaded('account-data');
      }
    }
  }, [accountLoading, accountError, markComponentLoaded, markComponentError]);



  // Memoize card visibility
  const cardVisibility = useMemo(() => {
    return globalConfig.components.airtableDepartmentFiltering ? 
      getDepartmentCardVisibility(department) : 
      { showWebCard: true, showBrandCard: true, showSMCard: true };
  }, [department]);

  // Memoize visible card count
  const visibleCardCount = useMemo(() => countVisibleCards(cardVisibility), [cardVisibility]);

  // Track when layout is ready
  useEffect(() => {
    if (effectiveLayout && visibleCardCount !== undefined) {
      markComponentLoaded('page-layout');
    }
  }, [effectiveLayout, visibleCardCount, markComponentLoaded]);

  // Optimized scroll handler
  const handleScroll = useCallback(throttle(() => {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercentage = scrollableHeight > 0 ? (currentScrollY / scrollableHeight) * 100 : 0;
    
    setScrollY(currentScrollY);
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (scrollPercentage <= 5) {
      setIsHeaderVisible(true);
    } else if (scrollPercentage > 25) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsHeaderVisible(false);
      }, 1000);
    } else {
      setIsHeaderVisible(true);
    }
  }, 16), []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Memoize header styles
  const headerStyles = useMemo(() => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const documentHeight = typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0;
    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercentage = scrollableHeight > 0 ? (scrollY / scrollableHeight) * 100 : 0;
    
    const headerOpacity = isHeaderVisible ? Math.max(0, 1 - scrollPercentage / 30) : 0;
    const headerBlur = scrollPercentage > 25 ? Math.min(10, (scrollPercentage - 25) / 5) : 0;
    const headerTranslateY = !isHeaderVisible ? -100 : Math.min(0, -scrollY * 0.3);

    return {
      opacity: headerOpacity,
      filter: `blur(${headerBlur}px)`,
      transform: `translateY(${headerTranslateY}px)`,
    };
  }, [scrollY, isHeaderVisible]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hide ALL content while loading overlay is active */}
      {!isAppLoading && (
        <>
          {/* Settings Component */}
          <div className="fixed top-4 left-4 z-[60] pointer-events-auto">
            <SettingsComponent visibleCardCount={visibleCardCount} />
          </div>

                              {/* Header Section */}
          <div 
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out"
            style={headerStyles}
          >
            <div className="container mx-auto px-4 pt-20 pb-8 bg-transparent max-w-4xl space-y-8">
              <AnimatedGroup
                variants={fadeInVariants}
                className="w-full"
                delay={0}
              >
                <h1 className="flex items-center justify-center gap-2 text-4xl font-[600] text-black">
                  Hello,{" "}
                  <AnimatedText
                    text={
                      strategyMemberData?.church_name || "there"
                    }
                    textClassName="text-4xl font-[800] text-black"
                    underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
                    underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10"
                    underlineDuration={1.5}
                  />
                </h1>
              </AnimatedGroup>

              <AnimatedGroup
                variants={fadeInVariants}
                className="flex justify-center max-h-10 w-full"
                delay={0}
              >
                <AccountManager accountNumber={parseInt(accountId || "306")} />
              </AnimatedGroup>
            </div>
          </div>

        {/* Spacer */}
        <div className="h-40"></div>

        {/* Main Content Area */}
        <div className="relative z-10 mt-20">
          <div className={`container mx-auto px-4 bg-transparent ${effectiveLayout === "grid" ? "max-w-8xl" : "max-w-4xl"}`}>
            
            {/* Critical LCP content - render immediately without waiting */}
            {!isClientReady ? (
              <ImmediateContent />
            ) : (
              <>
                {/* Loading states - handled by loading overlay */}
                {loading ? (
                  <div className="space-y-4">
                    {/* Loading overlay handles all loading states - no skeleton needed */}
                  </div>
                ) : (
                  <>
                    {/* Error handling */}
                    {globalConfig.components.airtableDepartmentFiltering && accountError && (
                      <div className="text-center text-red-500 py-8">
                        <p>Error loading account data: {accountError}</p>
                      </div>
                    )}

                    {/* Show no cards message immediately if applicable */}
                    {globalConfig.components.airtableDepartmentFiltering && 
                     !accountLoading && 
                     !hasVisibleCards(cardVisibility) && 
                     !accountError && (
                      <div className="text-center text-gray-500 py-8">
                        <p>Nothing to see here yet...</p>
                        {department && <p className="text-sm mt-2">Department: {department}</p>}
                      </div>
                    )}

                    {/* Account data is still loading */}
                    {globalConfig.components.airtableDepartmentFiltering && accountLoading && (
                      <div className="text-center text-gray-500 py-8">
                        <p>Loading account configuration...</p>
                      </div>
                    )}

                    {/* Render cards when ready */}
                    {!accountLoading && (
                      (globalConfig.components.airtableDepartmentFiltering ? hasVisibleCards(cardVisibility) : true) && (
                        effectiveLayout === "list" ? (
                          <div className="space-y-4">
                            {cardVisibility.showWebCard && (
                              <CardLoadingWrapper 
                                cardId="web-card" 
                                dependencies={[strategyMemberData]}
                                className="w-full flex justify-center"
                              >
                                <WebCard {...strategyMemberData} />
                              </CardLoadingWrapper>
                            )}
                            {cardVisibility.showBrandCard && (
                              <CardLoadingWrapper 
                                cardId="brand-card" 
                                dependencies={[strategyMemberData]}
                                className="w-full flex justify-center"
                              >
                                <BrandCard {...strategyMemberData} />
                              </CardLoadingWrapper>
                            )}
                            {cardVisibility.showSMCard && (
                              <CardLoadingWrapper 
                                cardId="sm-card" 
                                dependencies={[true]}
                                className="w-full flex justify-center"
                              >
                                <SMCard />
                              </CardLoadingWrapper>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4 justify-start">
                            {cardVisibility.showWebCard && (
                              <CardLoadingWrapper 
                                cardId="web-card" 
                                dependencies={[strategyMemberData]}
                                className="flex-shrink-0 w-[calc(50%-0.5rem)]"
                              >
                                <WebCard {...strategyMemberData} />
                              </CardLoadingWrapper>
                            )}
                            {cardVisibility.showBrandCard && (
                              <CardLoadingWrapper 
                                cardId="brand-card" 
                                dependencies={[strategyMemberData]}
                                className="flex-shrink-0 w-[calc(50%-0.5rem)]"
                              >
                                <BrandCard {...strategyMemberData} />
                              </CardLoadingWrapper>
                            )}
                            {cardVisibility.showSMCard && (
                              <CardLoadingWrapper 
                                cardId="sm-card" 
                                dependencies={[true]}
                                className="flex-shrink-0 w-[calc(50%-0.5rem)]"
                              >
                                <SMCard />
                              </CardLoadingWrapper>
                            )}
                          </div>
                        )
                      )
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Bottom spacing */}
          <div className="h-96"></div>
        </div>


        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent">
          <div className="container mx-auto px-4 py-20 bg-transparent max-w-4xl">
            <div className="text-center text-gray-500 py-8">
            </div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
