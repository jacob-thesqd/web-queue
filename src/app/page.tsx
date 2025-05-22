"use client";

import { StrategyMemberData } from '@/lib/supabase/getStrategyMemberData';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { useEffect, useState, Suspense } from 'react';
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { fadeInVariants } from "@/lib/animation-variants";
import { Skeleton } from "@/components/ui/skeleton";
import WebCard from "@/components/dept-cards/WebCard";
import SMCard from "@/components/dept-cards/SMCard";
import { useStrategyData } from '@/hooks/use-strategy-data';
import AvatarComponent from '@/components/ui/comp-412';

// Create a cache object to store data
const dataCache: Record<string, StrategyMemberData> = {};

function HomeContent() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('account') || undefined;
  const { data: strategyMemberData, loading } = useStrategyData(accountId);

  return (
    <div className="min-h-screen dot-grid-background">
          {loading ? (
            siteConfig.features.skeletonLoading ? (
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
            ) : (
              <p className="text-center"></p>
            )
          ) : (
            <>
              <div className="container mx-auto px-4 pt-20 pb-8 bg-transparent max-w-2xl z-50 space-y-8">
                <AnimatedGroup
                    variants={fadeInVariants}
                    className="w-full"
                    delay={0.3}
                  >
                  <h1 className="flex items-center justify-center gap-2 text-4xl font-[600] text-black">
                    Hello, <AnimatedText text={strategyMemberData ? strategyMemberData?.church_name : 'there'} textClassName="text-4xl font-[800] text-black" underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10" underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10" underlineDuration={1.5} />
                  </h1>
                </AnimatedGroup>
                <AnimatedGroup
                    variants={fadeInVariants}
                    className="flex justify-center max-h-10 w-full"
                    delay={0.3}
                  >
                  <AvatarComponent />
                </AnimatedGroup>
              </div>
              <div className="container mx-auto px-4 bg-transparent max-w-4xl z-50">        
                <AnimatedGroup
                  variants={fadeInVariants}
                  className="w-full flex justify-center"
                  delay={0.5}
                >
                  <WebCard {...strategyMemberData} />
                </AnimatedGroup>
              </div>

              <div className="container mx-auto px-4 bg-transparent max-w-4xl z-50">        
                <AnimatedGroup
                  variants={fadeInVariants}
                  className="w-full flex justify-center"
                  delay={0.5}
                >
                  <SMCard />
                </AnimatedGroup>
              </div>
            </>
          )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
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
    }>
      <HomeContent />
    </Suspense>
  );
}
