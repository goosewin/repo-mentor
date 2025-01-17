'use client'

import { detectLanguage } from '@/lib/languages'
import { FileCode, FileQuestion } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeViewerProps {
  content: string
  fileName?: string
}

function isBinaryContent(content: string, fileName?: string): boolean {
  // Check for common binary file indicators
  const hasBinaryContent = content.includes('\0') || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)
  const isBinaryExtension = fileName ? (
    fileName.endsWith('.lockb') ||
    fileName.endsWith('.bin') ||
    fileName.endsWith('.exe')
  ) : false

  return hasBinaryContent || isBinaryExtension
}

export function CodeViewer({ content, fileName }: CodeViewerProps) {
  if (!fileName) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
        <FileCode className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No File Selected</h3>
        <p className="text-center max-w-md">
          Select a file from the explorer to view its contents. You can then:
          <ul className="list-disc list-inside mt-2 text-left">
            <li>View the code with syntax highlighting</li>
            <li>Get an AI-powered explanation</li>
            <li>Ask questions about specific parts</li>
          </ul>
        </p>
      </div>
    )
  }

  if (isBinaryContent(content, fileName)) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
        <FileQuestion className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Binary File</h3>
        <p className="text-center max-w-md">
          This file appears to contain binary data and cannot be displayed as text.
        </p>
      </div>
    )
  }

  const language = detectLanguage(fileName)

  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        }}
        showLineNumbers
      >
        {content}
      </SyntaxHighlighter>
    </div>
  )
}
