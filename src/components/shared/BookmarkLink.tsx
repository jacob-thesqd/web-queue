"use client"

import React from "react"
import { Button } from "@/components/ui/button"

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

export default function BookmarkLink() {
  return (
    <div className="flex h-full flex-col gap-4">
      
      {bookmarkItems.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors rounded-md p-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[14px]">{item.name}</h3>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-shrink-0"
              onClick={() => {
                // Handle navigation or action
                console.log(`Navigate to: ${item.link}`)
              }}
            >
              View →
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 