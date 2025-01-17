'use client'

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { FileNode } from '@/utils/git'
import { ChevronDown, ChevronRight, FileCode, Folder } from 'lucide-react'
import { useState } from 'react'

interface TreeNodeProps {
  node: FileNode
  onSelectFile: (path: string) => void
  isCollapsed?: boolean
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelectFile, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isDirectory = node.type === 'directory'

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const handleClick = () => {
    if (!isDirectory) {
      onSelectFile(node.path)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const iconClassName = cn(
    "h-4 w-4",
    isCollapsed ? "mx-auto" : "mr-2"
  )

  const content = (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center rounded-md cursor-pointer hover:bg-accent",
          isCollapsed ? "justify-center py-2" : "px-2 py-1"
        )}
      >
        {isDirectory && !isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              toggleOpen()
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        {isDirectory ? (
          <Folder className={iconClassName} />
        ) : (
          <FileCode className={iconClassName} />
        )}
        {!isCollapsed && (
          <span className={cn("truncate", { "font-medium": isDirectory })}>
            {node.name}
          </span>
        )}
      </div>
      {isOpen && isDirectory && node.children && !isCollapsed && (
        <div className="pl-4">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  )

  return isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[300px]">
        <p className="truncate">{node.name}</p>
      </TooltipContent>
    </Tooltip>
  ) : content
}

interface TreeViewProps {
  files: FileNode[]
  onSelectFile: (filePath: string) => void
  isCollapsed?: boolean
}

export function TreeView({ files, onSelectFile, isCollapsed }: TreeViewProps) {
  return (
    <div className="space-y-1">
      {files.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          onSelectFile={onSelectFile}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  )
}
