"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData"
import DiscoverySubmissionModal from "./DiscoverySubmissionModal"
import { useDiscoverySubmission } from "@/hooks/useDiscoverySubmission"

interface BookmarkItem {
  name: string
  link: string
}

const bookmarkItems: BookmarkItem[] = [
  {
    name: "Discovery Questionnaire Submission",
    link: "#discovery-form"
  },
  {
    name: "MarkUp Folder",
    link: "#markup-folder"
  },
  {
    name: "Content Collection Form",
    link: "#content-form"
  },
  {
    name: "Loom Video Folder",
    link: "#loom-videos"
  }
]

interface BookmarkLinkProps {
  memberData?: Partial<StrategyMemberData>;
}

export default function BookmarkLink({ memberData }: BookmarkLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error, fetchSubmission, reset } = useDiscoverySubmission();

  const handleItemClick = async (item: BookmarkItem) => {
    if (item.name === "Discovery Questionnaire Submission") {
      if (!memberData?.account) {
        console.error("No account number available for discovery submission");
        return;
      }
      
      console.log(`Opening discovery submission modal for account: ${memberData.account}`);
      setIsModalOpen(true);
      await fetchSubmission(memberData.account);
    } else {
      // Handle other bookmark actions
      console.log(`Navigate to: ${item.link}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  return (
    <>
      <div className="flex h-full flex-col gap-4">      
        {bookmarkItems.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-[9px] font-sm">{item.name}</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-shrink-0"
                onClick={() => handleItemClick(item)}
              >
                View <span className="text-[14px] font-bold">→</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DiscoverySubmissionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        submission={data?.submission || null}
        memberNumber={memberData?.account}
        loading={loading}
        error={error || data?.error}
      />
    </>
  )
} 