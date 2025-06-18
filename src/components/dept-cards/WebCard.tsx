"use client";

import { motion, Easing } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";
import BookmarkLink from "@/components/shared/BookmarkLink";
import MilestoneStepperComponent from "@/components/ui/comp-525";
import { useAirtableAccount, convertMilestoneToSteps, MilestoneData } from "@/hooks/useAirtableAccount";
import { globalConfig } from "@/config/globalConfig";

interface WebCardProps extends Partial<StrategyMemberData> {
  externalMilestoneData?: MilestoneData | null;
}

export default function WebCard({ externalMilestoneData, ...memberData }: WebCardProps) {
  // Only fetch account data if milestone data is not provided externally
  const shouldFetchAccount = !externalMilestoneData && (globalConfig.components.airtableQueueNumber || globalConfig.components.airtableMilestoneStepper);
  
  // Fetch comprehensive account data from Airtable (includes queue number, milestone data, and all other data)
  const { 
    queueNumber, 
    milestoneData, 
    error: accountError 
  } = useAirtableAccount(shouldFetchAccount ? memberData.account : undefined);

  // Use external milestone data if provided, otherwise use fetched data
  const finalMilestoneData = externalMilestoneData || milestoneData;
  
  // Convert milestone data to stepper format
  const { steps, currentStep } = convertMilestoneToSteps(finalMilestoneData);
  const hasMilestoneData = finalMilestoneData && finalMilestoneData.currentMilestone;

  // If external milestone data is provided, don't show error states
  const error = externalMilestoneData ? null : accountError;

  return (
    <motion.div
      className="w-full max-w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.4 }}
    >
    <Card variant={globalConfig.components.cardVariant} className="overflow-hidden">
      {/* Mobile Header - Compact horizontal layout */}
      <CardHeader className="sm:hidden flex flex-row justify-between items-center px-4 gap-2">
        <div className="flex flex-row items-center min-w-0 flex-1">
          <img src="/dept_icons/web.png" alt="Squad Logo" className="w-8 h-8 mr-2 flex-shrink-0" />
          <h2 className="text-lg font-[600] text-black text-left truncate">
            Web Squad
          </h2>
        </div>
        <div className="flex-shrink-0">
          {globalConfig.components.airtableQueueNumber ? (
            // Use Airtable queue number data
            accountError ? (
              <Badge className="text-xs px-2 py-1" variant="squad">
                Error
              </Badge>
            ) : queueNumber ? (
              <Badge className="text-xs px-2 py-1" variant="squad">
                <span className="font-bold">Web Queue # {queueNumber}</span>
              </Badge>
            ) : null // Don't show anything if no queue number found
          ) : (
            // Fallback to original memberData.queue_num logic
            memberData?.queue_num ? (
              <Badge className="text-xs px-2 py-1" variant="squad">
                <span className="font-bold">Web Queue # {memberData.queue_num}</span>
              </Badge>
            ) : (
              <Badge className="text-xs px-2 py-1">
                Not Queued
              </Badge>
            )
          )}
        </div>
      </CardHeader>

      {/* Desktop Header - Horizontal layout with original styling */}
      <CardHeader className="hidden sm:flex flex-row justify-between items-center px-4 sm:px-6 gap-4">
        <div className="flex flex-row items-center">
          <img src="/dept_icons/web.png" alt="Squad Logo" className="w-9 h-9 mr-3" />
          <h2 className="text-xl sm:text-2xl font-[600] text-black text-left">
            Web Squad
          </h2>
        </div>
        <div className="flex-shrink-0">
          {globalConfig.components.airtableQueueNumber ? (
            // Use Airtable queue number data
            accountError ? (
              <Badge className="items-baseline gap-2 text-[0.9rem] px-3" variant="squad">
                Queue Error
              </Badge>
            ) : queueNumber ? (
              <Badge className="items-baseline gap-2 text-[0.9rem] px-3" variant="squad">
                Current Queue Number
                <span className="text-primary-foreground/60 text-[0.9rem] font-medium">
                  {queueNumber}
                </span>
              </Badge>
            ) : null // Don't show anything if no queue number found
          ) : (
            // Fallback to original memberData.queue_num logic
            memberData?.queue_num ? (
              <Badge className="items-baseline gap-2 text-[0.9rem] px-3" variant="squad">
                Current Queue Number
                <span className="text-primary-foreground/60 text-[0.9rem] font-medium">
                  {memberData.queue_num}
                </span>
              </Badge>
            ) : (
              <Badge className="items-baseline gap-2 text-[0.9rem] px-3">
                Not in Web Queue
              </Badge>
            )
          )}
        </div>
      </CardHeader>

      {globalConfig.components.airtableMilestoneStepper && hasMilestoneData && (
        <div className="flex flex-col w-full px-4 sm:px-6 pb-4">
          <h2 className="text-base sm:text-lg font-[600] text-black text-left mb-4">
            Milestone Progress
          </h2>
          {error ? (
            <div className="text-center text-red-500 py-6 px-4">
              <p className="text-sm">Error loading milestone data</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          ) : (
            <MilestoneStepperComponent 
              steps={steps} 
              currentStep={currentStep} 
              loading={false}
              mode="grid"
            />
          )}
        </div>
      )}

      <Accordion type="single" collapsible className="px-4 sm:px-6 mt-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h2 className="text-base sm:text-lg font-[600] text-black text-left">
              Key Bookmark Links
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            <BookmarkLink memberData={memberData} excludeItems={["Brand Guide"]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            <h2 className="text-base sm:text-lg font-[600] text-black text-left">
              Terms & Conditions
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-left justify-between gap-4 py-1 rounded">
              <Button
                variant="glass"
                className="w-fit flex-shrink-0"
                onClick={() => {
                  window.open(globalConfig.termsUrl, '_blank');
                }}
              >
                Click here to view our T&Cs <span className="text-[14px] font-bold">→</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
    </motion.div>
  );
}
