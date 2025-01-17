'use client'

import { Button } from "@/components/ui/button"
import type { FileNode } from '@/utils/git'
import { ChevronDown, ChevronRight, FileCode, Folder } from 'lucide-react'
import { useState } from 'react'

interface TreeNodeProps {
  node: FileNode
  onSelectFile: (path: string) => void
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelectFile }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isDirectory = node.type === 'directory'

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div>
      <div className="flex items-center">
        {isDirectory ? (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={toggleOpen}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="w-6" />
        )}
        <Button
          variant="ghost"
          className="p-1 h-6 hover:bg-accent"
          onClick={() => !isDirectory && onSelectFile(node.path)}
        >
          {isDirectory ? (
            <Folder className="mr-2 h-4 w-4" />
          ) : (
            <FileCode className="mr-2 h-4 w-4" />
          )}
          {node.name}
        </Button>
      </div>
      {isOpen && isDirectory && node.children && (
        <div className="ml-4">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeViewProps {
  files: FileNode[]
  onSelectFile: (filePath: string) => void
}

export function TreeView({ files, onSelectFile }: TreeViewProps) {
  return (
    <div className="space-y-1">
      {files.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  )
}
