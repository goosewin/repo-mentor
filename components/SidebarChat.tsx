'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { Bot, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SidebarChatProps {
  fileName?: string
  fileContent?: string
}

export function SidebarChat({ fileName, fileContent }: SidebarChatProps) {
  const [currentFile, setCurrentFile] = useState<string | undefined>(undefined)
  const [currentContent, setCurrentContent] = useState<string | undefined>(undefined)
  const shouldExplain = useRef(false)

  const { messages, input, handleInputChange, handleSubmit: rawHandleSubmit, setMessages, append, isLoading, stop } = useChat({
    api: '/api/chat',
    id: fileName || undefined
  })

  // Handle file changes
  useEffect(() => {
    if (fileName !== currentFile) {
      stop()
      setMessages([])
      setCurrentFile(fileName)
      setCurrentContent(undefined)
      shouldExplain.current = true
    }
  }, [fileName, currentFile, stop, setMessages])

  // Handle content updates and start explanation
  useEffect(() => {
    if (fileContent !== currentContent) {
      setCurrentContent(fileContent)
      if (shouldExplain.current && fileContent && fileName) {
        shouldExplain.current = false
        append({
          content: `Please explain the code in ${fileName}.`,
          role: 'user',
          id: `explain-${Date.now()}`
        }, {
          data: { fileName, fileContent }
        })
      }
    }
  }, [fileContent, currentContent, fileName, append])

  if (!fileName) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a file to get an explanation.</p>
      </div>
    )
  }

  if (!currentContent) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
          <p>Loading file...</p>
        </div>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !currentContent || !fileName) return
    rawHandleSubmit(e, {
      data: { fileName, fileContent: currentContent }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-4 p-4 rounded-lg',
              message.role === 'assistant' ? 'bg-muted/50' : 'bg-primary/10'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
              {message.role === 'assistant' ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              <p className="leading-normal text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t pt-4 mt-4">
        <form onSubmit={onSubmit}>
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about the code..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
