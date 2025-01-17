'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FileCode } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface TreeNodeProps {
  name: string
  children?: TreeNodeProps[]
  onSelectFile: (path: string) => void
  path: string
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, children, onSelectFile, path }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isFolder = Array.isArray(children)

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div>
      <div className="flex items-center">
        {isFolder ? (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={toggleOpen}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="w-6" />
        )}
        <Button
          variant="ghost"
          className="p-1 h-6 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => !isFolder && onSelectFile(path)}
        >
          {isFolder ? (
            <Folder className="mr-2 h-4 w-4" />
          ) : (
            <FileCode className="mr-2 h-4 w-4" />
          )}
          {name}
        </Button>
      </div>
      {isOpen && isFolder && (
        <div className="ml-4">
          {children.map((child, index) => (
            <TreeNode
              key={index}
              {...child}
              onSelectFile={onSelectFile}
              path={`${path}/${child.name}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeViewProps {
  onSelectFile: (path: string) => void
}

export const TreeView: React.FC<TreeViewProps> = ({ onSelectFile }) => {
  const treeData: TreeNodeProps = {
    name: 'root',
    children: [
      {
        name: 'src',
        children: [
          { 
            name: 'components', 
            children: [
              { name: 'Button.tsx', children: undefined },
              { name: 'Input.tsx', children: undefined },
            ]
          },
          { 
            name: 'pages', 
            children: [
              { name: 'index.tsx', children: undefined },
              { name: 'about.tsx', children: undefined },
            ]
          },
          { 
            name: 'styles', 
            children: [
              { name: 'globals.css', children: undefined },
            ]
          },
        ],
      },
      { name: 'package.json', children: undefined },
      { name: 'tsconfig.json', children: undefined },
    ],
    path: '',
    onSelectFile: () => {},
  }

  return <TreeNode {...treeData} onSelectFile={onSelectFile} />
}

