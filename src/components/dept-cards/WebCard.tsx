import { Card, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";

export default function WebCard(memberData: Partial<StrategyMemberData> = {}) {
    return (
        <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex-grow">
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

        <Accordion type="single" collapsible className="px-12 mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="flex gap-2 text-lg font-[600] text-black text-left">
                Key Bookmark Links
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              <p>
                Test content.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    );
}