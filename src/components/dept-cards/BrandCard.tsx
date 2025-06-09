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
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
      <div className="flex flex-row items-center">
        <img src="/dept_icons/brand.png" alt="Squad Logo" className="w-9 h-9 mr-1" />
          <h2 className="flex gap-2 text-2xl font-[600] text-black text-left">
            Brand Squad
          </h2>
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
          <div className="flex items-left justify-between gap-4 py-1 rounded">
              <Button
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
  );
}
