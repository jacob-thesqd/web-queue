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

export default function WebCard(memberData: Partial<StrategyMemberData> = {}) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <img src="/dept_icons/web.png" alt="Squad Logo" className="w-9 h-9 mr-1" />
          <h2 className="flex gap-2 text-2xl font-[600] text-black text-left">
            Web Squad
          </h2>
        </div>
        <div className="flex-shrink-0">
          {memberData?.queue_num ? (
            <Badge className="items-baseline gap-2 text-[0.9rem] px-3">
              Current Queue Number
              <span className="text-primary-foreground/60 text-[0.9rem] font-medium">
                {memberData.queue_num}
              </span>
            </Badge>
          ) : (
            <Badge className="items-baseline gap-2 text-[0.9rem] px-3">
              Not in Web Queue
            </Badge>
          )}
        </div>
      </CardHeader>

      <div className="flex items-center justify-center w-full px-12">
        <MilestoneStepperComponent />
      </div>

      <Accordion type="single" collapsible className="px-12 mt-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h2 className="flex gap-2 text-lg font-[600] text-black text-left">
              Key Bookmark Links
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            <BookmarkLink />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            <h2 className="flex gap-2 text-lg font-[600] text-black text-left">
              Terms & Conditions
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-left justify-between gap-4 py-1 px-2 rounded">
              <div className="text-sm text-gray-600 italic ml-4">
                Terms & Conditions
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit flex-shrink-0"
                onClick={() => {
                  // Handle navigation or action
                  console.log(`Navigate to`);
                }}
              >
                View →
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
