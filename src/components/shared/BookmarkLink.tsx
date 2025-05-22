"use client"

import React from "react"
import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core"
import { useTree } from "@headless-tree/react"
import { Button } from "@/components/ui/button"

import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree"

interface BookmarkItem {
  name: string
  description?: string
  link?: string
  children?: string[]
  type?: 'folder' | 'description' | 'action' | 'item'
}

const bookmarkItems: Record<string, BookmarkItem> = {
  root: {
    name: "Bookmarks",
    children: ["discovery", "markup", "content", "loom", "terms"],
    type: 'folder'
  },
  discovery: {
    name: "Discovery Questionnaire Submission",
    children: ["discovery-item"],
    type: 'folder'
  },
  "discovery-item": {
    name: "Submit your project discovery questionnaire.",
    link: "#discovery-form",
    type: 'item'
  },
  markup: {
    name: "MarkUp Folder",
    children: ["markup-item"],
    type: 'folder'
  },
  "markup-item": {
    name: "Access design mockups, wireframes, and visual assets for your project.",
    link: "#markup-folder",
    type: 'item'
  },
  content: {
    name: "Content Collection Form",
    children: ["content-item"],
    type: 'folder'
  },
  "content-item": {
    name: "Upload and organize all content materials including text, images, and media files.",
    link: "#content-form",
    type: 'item'
  },
  loom: {
    name: "Loom Video Folder",
    children: ["loom-item"],
    type: 'folder'
  },
  "loom-item": {
    name: "View instructional videos and project walkthroughs to guide your process.",
    link: "#loom-videos",
    type: 'item'
  }
}

const indent = 22

export default function BookmarkLink() {
  const tree = useTree<BookmarkItem>({
    initialState: {
      expandedItems: ["root"],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item?.getItemData()?.name,
    isItemFolder: (item) => (item?.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => bookmarkItems[itemId],
      getChildren: (itemId) => bookmarkItems[itemId].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })

  return (
    <div className="flex h-full flex-col gap-2">
      <Tree indent={indent} tree={tree}>
        {tree.getItems().map((item) => {
          const itemData = item.getItemData()
          const isParentFolder = itemData?.type === 'folder' && item?.getId() !== 'root'
          
          return (
            <TreeItem key={item.getId()} item={item} className={isParentFolder ? "mb-0" : ""}>
              <div className="flex flex-col gap-2 w-full">
                {itemData?.type === 'item' ? (
                  <div className="flex items-left justify-between gap-4 py-1 px-2 rounded">
                    <div className="text-sm text-gray-600 italic ml-8 flex items-center">
                      {itemData?.name}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-fit flex-shrink-0"
                      onClick={() => {
                        // Handle navigation or action
                        console.log(`Navigate to: ${itemData?.link}`)
                      }}
                    >
                      View →
                    </Button>
                  </div>
                ) : (
                  <div className={isParentFolder ? "py-1 font-medium" : ""}>
                    <TreeItemLabel />
                  </div>
                )}
              </div>
            </TreeItem>
          )
        })}
      </Tree>
    </div>
  )
} 