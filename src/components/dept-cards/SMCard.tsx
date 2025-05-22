import { Card, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Component from "@/components/ui/comp-552";
import { Button } from "@/components/ui/button";
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";

export default function WebCard(memberData: Partial<StrategyMemberData> = {}) {
    return (
      <Card>
      <CardHeader>
        <h2 className="flex gap-2 text-2xl font-[600] text-black text-left">
          Social Media Squad
        </h2>
      </CardHeader>

      <span className="text-muted-foreground text-sm px-8">
        Upload photos from Sunday
      </span>
      <div className="px-8 py-2 max-w-4xl mx-auto">
        <Component />
      </div>
      <Accordion type="single" collapsible className="px-12 mt-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h2 className="flex gap-2 text-lg font-[600] text-black text-left">
              Access Vista Social
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            <p>
              Vista Social is a social media platform that allows you to upload photos from Sunday.
            </p>
            <Button className="mt-4" asChild>
                <a href="https://vistasocial.com/login" target="_blank" rel="noopener noreferrer">
                  Login
                </a>
              </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
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