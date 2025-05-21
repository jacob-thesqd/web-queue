"use client";

import { StrategyMemberData, getStrategyMemberData } from '@/lib/supabase/getStrategyMemberData';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge"
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { fadeInVariants } from "@/lib/animation-variants";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoGridDemo } from "@/components/ui/bento-grid-demo";

// Create a cache object to store data
const dataCache: Record<string, StrategyMemberData> = {};

export default function Home() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('account') || undefined;
  const [memberData, setMemberData] = useState<StrategyMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      // Check if data is already in cache
      if (accountId && dataCache[accountId]) {
        setMemberData(dataCache[accountId]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const data = await getStrategyMemberData(accountId);
        
        if (data) {
          setMemberData(data);
          
          // Save to cache
          if (accountId) {
            dataCache[accountId] = data;
          }
        } else {
          setMemberData(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching strategy member data:', err);
        setMemberData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [accountId]);

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
              <p className="text-center">Loading...</p>
            )
          ) : (
            <>
              <div className="container mx-auto px-4 pt-20 pb-8 bg-transparent max-w-2xl z-50">
                <AnimatedGroup
                    variants={fadeInVariants}
                    className="w-full"
                    delay={0.3}
                  >
                  <h1 className="flex items-center justify-center gap-2 text-4xl font-[700] text-black">
                    Hello <AnimatedText text={',' + memberData?.church_name || ', there'} textClassName="text-4xl font-[800] text-black" underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10" underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10" underlineDuration={1.5} />
                  </h1>
                </AnimatedGroup>
              <div className="flex justify-center">
              <AnimatedGroup
                    variants={fadeInVariants}
                    className="w-full flex justify-center items-center"
                    delay={0.3}
                  >
                <Badge className="items-baseline gap-2 mt-8 text-[0.9rem] px-3">
                    Current Queue Number
                    <span className="text-primary-foreground/60 text-[0.9rem] font-medium">
                    {memberData?.queue_num}
                    </span>
                </Badge>
                </AnimatedGroup>
              </div>
              </div>
              {siteConfig.features.bentoGrid && (<div className="container mx-auto px-4 bg-transparent max-w-4xl z-50">        
                <AnimatedGroup
                  variants={fadeInVariants}
                  className="w-full mt-8"
                  delay={0.5}
                >
                  <BentoGridDemo />
                </AnimatedGroup>
              </div>)}
            </>
          )}
    </div>
  );
}
