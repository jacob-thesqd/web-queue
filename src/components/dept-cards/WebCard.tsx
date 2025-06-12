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
import { useAirtableTaskMilestones } from "@/hooks/useAirtableTaskMilestones";
import { useAirtableAccount } from "@/hooks/useAirtableAccount";
import { globalConfig } from "@/config/globalConfig";

export default function WebCard(memberData: Partial<StrategyMemberData> = {}) {
  // Use Airtable task milestones with the same 3-step logic as the original milestone tracking
  const { steps, currentStep, loading, error } = useAirtableTaskMilestones(
    memberData.account,
    0 // Start at first milestone - could be made dynamic based on account progress
  );

  // Fetch comprehensive account data from Airtable (includes queue number and all other data)
  const { queueNumber, loading: accountLoading, error: accountError } = useAirtableAccount(
    globalConfig.components.airtableQueueNumber ? memberData.account : undefined
  );

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.4 }}
    >
    <Card variant={globalConfig.components.cardVariant}>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <img src="/dept_icons/web.png" alt="Squad Logo" className="w-9 h-9 mr-1" />
          <h2 className="flex gap-2 text-2xl font-[600] text-black text-left">
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

      {globalConfig.components.airtableMilestoneStepper && (
        <div className="flex flex-col w-full px-12 pb-4">
          <h2 className="flex gap-2 text-lg font-[600] text-black text-left mb-4">
            Milestone Progress
          </h2>
          {error ? (
            <div className="text-center text-red-500 py-8">
              <p>Error loading task milestones: {error}</p>
            </div>
          ) : (
            <MilestoneStepperComponent 
              steps={steps} 
              currentStep={currentStep} 
              loading={loading}
              mode="grid"
            />
          )}
        </div>
      )}

      <Accordion type="single" collapsible className="px-12 mt-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h2 className="flex gap-2 text-lg font-[600] text-black text-left">
              Key Bookmark Links
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            <BookmarkLink memberData={memberData} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            <h2 className="flex gap-2 text-lg font-[600] text-black text-left">
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
