import { Card, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SocialMediaUploader from "@/components/ui/SocialMediaUploader";
import { Button } from "@/components/ui/button";
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";

export default function SMCard(memberData: Partial<StrategyMemberData> = {}) {
    return (
      <Card>
      <CardHeader>
      <div className="flex flex-row items-center">
      <img src="/dept_icons/social.png" alt="Squad Logo" className="w-9 h-9 mr-1" />
        <h2 className="flex gap-2 text-2xl font-[600] text-black text-left">
          Social Media Squad
        </h2>
        </div>
      </CardHeader>

      <h2 className="flex gap-2 text-md font-[600] text-black text-left px-8">
        Upload photos from Sunday
      </h2>
      <div className="px-8 py-2 max-w-4xl mx-auto">
        <SocialMediaUploader accountNumber={memberData.account} />
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