"use client";

import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useEffect, useState, Suspense, useRef } from "react";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { fadeInVariants } from "@/lib/animation-variants";
import { Skeleton } from "@/components/ui/skeleton";
import WebCard from "@/components/dept-cards/WebCard";
import SMCard from "@/components/dept-cards/SMCard";
import BrandCard from "@/components/dept-cards/BrandCard";
import { useStrategyData } from "@/hooks/use-strategy-data";
import AccountManager from "@/components/squad-components/AccountManager";
import { useLayout } from "@/hooks/use-layout";

// Create a cache object to store data
const dataCache: Record<string, StrategyMemberData> = {};

function HomeContent() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account") || undefined;
  const { data: strategyMemberData, loading } = useStrategyData(accountId);
  const { effectiveLayout } = useLayout();
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = (currentScrollY / scrollableHeight) * 100;
      
      setScrollY(currentScrollY);
      
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      // Always show header when at the very top (0-5% scroll)
      if (scrollPercentage <= 5) {
        setIsHeaderVisible(true);
      }
      // Hide header after scrolling 25% with a 1 second delay
      else if (scrollPercentage > 25) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsHeaderVisible(false);
        }, 1000);
      } else {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Clean up timeout on unmount
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Calculate transform values based on scroll percentage
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const documentHeight = typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0;
  const scrollableHeight = documentHeight - windowHeight;
  const scrollPercentage = scrollableHeight > 0 ? (scrollY / scrollableHeight) * 100 : 0;
  
  const headerOpacity = isHeaderVisible ? Math.max(0, 1 - scrollPercentage / 30) : 0;
  const headerBlur = scrollPercentage > 25 ? Math.min(10, (scrollPercentage - 25) / 5) : 0;
  const headerTranslateY = !isHeaderVisible ? -100 : Math.min(0, -scrollY * 0.3);

  return (
    <div className="min-h-screen dot-grid-background">
      {loading ? (
        siteConfig.features.skeletonLoading ? (
          <div className="container mx-auto px-4 py-20 bg-transparent max-w-4xl z-50">
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="flex justify-center mt-8">
                <Skeleton className="h-6 w-36" />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center"></p>
        )
      ) : (
        <>
          {/* Sticky Header Section */}
          <div 
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out"
            style={{
              opacity: headerOpacity,
              filter: `blur(${headerBlur}px)`,
              transform: `translateY(${headerTranslateY}px)`,
            }}
          >
            <div className="container mx-auto px-4 pt-20 pb-8 bg-transparent max-w-4xl space-y-8">
              <AnimatedGroup
                variants={fadeInVariants}
                className="w-full"
                delay={0.3}
              >
                <h1 className="flex items-center justify-center gap-2 text-4xl font-[600] text-black">
                  Hello,{" "}
                  <AnimatedText
                    text={
                      strategyMemberData
                        ? strategyMemberData?.church_name
                        : "there"
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
                delay={0.3}
              >
                <AccountManager accountNumber={parseInt(accountId || "306")} />
              </AnimatedGroup>
            </div>
          </div>

          {/* Spacer to prevent content jump */}
          <div className="h-40"></div>

          {/* Cards Section - will scroll behind header */}
          <div className="relative z-10 mt-20">
            <div className={`container mx-auto px-4 bg-transparent ${effectiveLayout === "grid" ? "max-w-8xl" : "max-w-4xl"}`}>
              {effectiveLayout === "list" ? (
                <div className="space-y-4">
                  <AnimatedGroup
                    variants={fadeInVariants}
                    className="w-full flex justify-center"
                    delay={0.5}
                  >
                    <WebCard {...strategyMemberData} />
                  </AnimatedGroup>

                  <AnimatedGroup
                    variants={fadeInVariants}
                    className="w-full flex justify-center"
                    delay={0.5}
                  >
                    <BrandCard />
                  </AnimatedGroup>

                  <AnimatedGroup
                    variants={fadeInVariants}
                    className="w-full flex justify-center"
                    delay={0.5}
                  >
                    <SMCard />
                  </AnimatedGroup>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-start">
                  <AnimatedGroup
                    variants={fadeInVariants}
                    className="flex-shrink-0 w-[calc(50%-0.5rem)]"
                    delay={0.5}
                  >
                    <WebCard {...strategyMemberData} />
                  </AnimatedGroup>

                  <AnimatedGroup
                    variants={fadeInVariants}
                    className="flex-shrink-0 w-[calc(50%-0.5rem)]"
                    delay={0.5}
                  >
                    <BrandCard />
                  </AnimatedGroup>

                  <AnimatedGroup
                    variants={fadeInVariants}
                    className="flex-shrink-0 w-[calc(50%-0.5rem)]"
                    delay={0.5}
                  >
                    <SMCard />
                  </AnimatedGroup>
                </div>
              )}
            </div>

            {/* Extra space at bottom for better scroll experience */}
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
        <div className="min-h-screen dot-grid-background">
          <div className="container mx-auto px-4 py-20 bg-transparent max-w-2xl z-50">
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="flex justify-center mt-8">
                <Skeleton className="h-6 w-36" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
