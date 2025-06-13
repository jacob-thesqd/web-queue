"use client";

import { motion, Easing } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";
import BookmarkLink from "@/components/shared/BookmarkLink";
import { Button } from "../ui/button";
import { globalConfig } from "../../config/globalConfig";

export default function BrandCard(
  memberData: Partial<StrategyMemberData> = {}
) {
  return (
    <motion.div
      className="w-full max-w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.2 }}
    >
      <Card variant={globalConfig.components.cardVariant} className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-6">
        <div className="flex flex-row items-center">
          <img src="/dept_icons/brand.png" alt="Squad Logo" className="w-9 h-9 mr-3" />
            <h2 className="text-xl sm:text-2xl font-[600] text-black text-left">
              Brand Squad
            </h2>
          </div>
        </CardHeader>

        <Accordion type="single" collapsible className="px-4 sm:px-6 mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-base sm:text-lg font-[600] text-black text-left">
                Key Bookmark Links
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              <BookmarkLink memberData={memberData} excludeItems={["Content Collection Form"]} />
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
