"use client";

import { motion, Easing } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import SocialMediaUploader from "@/components/ui/SocialMediaUploader";
import { Button } from "@/components/ui/button";
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData";
import { globalConfig } from "@/config/globalConfig";

export default function SMCard(memberData: Partial<StrategyMemberData> = {}) {
    return (
      <motion.div
        className="w-full max-w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as Easing, delay: 0.3 }}
      >
        <Card variant={globalConfig.components.cardVariant} className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-row items-center">
        <img src="/dept_icons/social.png" alt="Squad Logo" className="w-9 h-9 mr-3" />
          <h2 className="text-xl sm:text-2xl font-[600] text-black text-left">
            Social Media Squad
          </h2>
          </div>
        </CardHeader>

        <h2 className="text-sm sm:text-base font-[600] text-black text-left px-4 sm:px-6">
          Upload photos from Sunday
        </h2>
        <div className="px-4 sm:px-6 py-2 max-w-4xl mx-auto">
          <SocialMediaUploader accountNumber={memberData.account} />
        </div>
        <div className="px-4 sm:px-6 py-4 pb-6">
          <h2 className="text-base sm:text-lg font-[600] text-black text-left">
            Access Vista Social
          </h2>
          <Button className="mt-4" asChild variant="glass">
              <a href="https://vistasocial.com/login" target="_blank" rel="noopener noreferrer">
                Login <span className="text-[14px] font-bold">→</span>
              </a>
            </Button>
        </div>
      </Card>
      </motion.div>
    );
}