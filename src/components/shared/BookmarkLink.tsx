"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { StrategyMemberData } from "@/lib/supabase/getStrategyMemberData"
import DiscoverySubmissionModal from "./DiscoverySubmissionModal"
import { useDiscoverySubmission } from "@/hooks/useDiscoverySubmission"
import { useAirtableAccount } from "@/hooks/useAirtableAccount"
import { globalConfig } from "@/config/globalConfig"

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
  const { markupLink, discoveryFormSubmissionId, contentSnareLink, loading: accountLoading } = useAirtableAccount(memberData?.account);

  const handleItemClick = async (item: BookmarkItem) => {
    if (item.name === "Discovery Questionnaire Submission") {
      if (!memberData?.account) {
        console.error("No account number available for discovery submission");
        return;
      }
      
      if (!discoveryFormSubmissionId) {
        console.log("No discovery form submission ID available for this account");
        return;
      }
      
      console.log(`Opening discovery submission modal for account: ${memberData.account}`);
      setIsModalOpen(true);
      await fetchSubmission(memberData.account);
    } else if (item.name === "MarkUp Folder") {
      if (markupLink) {
        window.open(markupLink, '_blank');
      } else {
        console.log("No markup link available for this account");
      }
    } else if (item.name === "Content Collection Form") {
      if (contentSnareLink) {
        window.open(contentSnareLink, '_blank');
      } else {
        console.log("No content collection form available for this account");
      }
    } else {
      // Handle other bookmark actions
      console.log(`Navigate to: ${item.link}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const isButtonDisabled = (itemName: string) => {
    if (accountLoading) return true;
    
    switch (itemName) {
      case "Discovery Questionnaire Submission":
        return !discoveryFormSubmissionId;
      case "MarkUp Folder":
        return !markupLink;
      case "Content Collection Form":
        return !contentSnareLink;
      default:
        return false;
    }
  };

  const getButtonText = (itemName: string) => {
    if (accountLoading) return "Loading...";
    
    switch (itemName) {
      case "Discovery Questionnaire Submission":
        return !discoveryFormSubmissionId ? "No Submission" : "View";
      case "MarkUp Folder":
        return !markupLink ? "No Markup Folder" : "View";
      case "Content Collection Form":
        return !contentSnareLink ? "No Form Yet" : "View";
      default:
        return "View";
    }
  };

  return (
    <>
      <div className="flex h-full flex-col gap-4 border-t border-white/10 pt-4">      
        {bookmarkItems.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 border-b border-white/10 last:border-b-0">
            <div className="flex items-center justify-between">
              <h3 className="font-[9px] font-sm">{item.name}</h3>
              <Button 
                variant={globalConfig.components.cardVariant === 'glass' ? 'glass' : 'outline'} 
                size="sm"
                className="flex-shrink-0"
                onClick={() => handleItemClick(item)}
                disabled={isButtonDisabled(item.name)}
              >
                {getButtonText(item.name)} {!isButtonDisabled(item.name) && <span className="text-[14px] font-bold">→</span>}
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