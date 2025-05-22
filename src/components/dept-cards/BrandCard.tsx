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

export default function BrandCard(
  memberData: Partial<StrategyMemberData> = {}
) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex-grow">
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
