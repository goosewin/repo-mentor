'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { Message, useChat } from 'ai/react'
import { Bot, User } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface SidebarChatProps {
  fileName?: string
  fileContent?: string
}

// Keep track of file conversations across component remounts
const fileConversations = new Map<string, { messages: Message[], pendingMessage: boolean }>()

export function SidebarChat({ fileName, fileContent }: SidebarChatProps = {}) {
  const previousFile = useRef<string | undefined>(undefined)
  const isFirstLoad = useRef(true)

  const { messages, input, handleInputChange, handleSubmit, setMessages, append, isLoading, stop } = useChat({
    api: '/api/chat',
    body: {
      fileName,
      fileContent
    },
    id: fileName, // Each file gets its own chat instance
    onFinish: () => {
      if (fileName) {
        fileConversations.set(fileName, {
          messages: messages,
          pendingMessage: false
        })
      }
    },
    onError: () => {
      if (fileName) {
        fileConversations.set(fileName, {
          messages: messages,
          pendingMessage: false
        })
      }
    }
  })

  // Start initial conversation when file is loaded
  useEffect(() => {
    if (fileName && fileContent && isFirstLoad.current) {
      isFirstLoad.current = false
      setMessages([])
      void append({
        content: `Please explain the code in ${fileName}.`,
        role: 'user',
      })
    }
  }, [fileName, fileContent, append, setMessages])

  // Handle file changes and restore previous conversations
  useEffect(() => {
    if (fileName === previousFile.current) return

    // Cancel any ongoing streaming
    stop()

    // Save current conversation if any
    if (previousFile.current && messages.length > 0) {
      fileConversations.set(previousFile.current, {
        messages: messages,
        pendingMessage: false
      })
    }

    // Restore previous conversation or start new one
    if (fileName) {
      const prevConversation = fileConversations.get(fileName)
      if (prevConversation) {
        setMessages(prevConversation.messages)
      } else if (fileContent && !isFirstLoad.current) { // Don't start new conversation if it's first load
        setMessages([])
        void append({
          content: `Please explain the code in ${fileName}.`,
          role: 'user',
        })
      }
    }

    previousFile.current = fileName
  }, [fileName, fileContent, messages, setMessages, append, stop])

  if (!fileName) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Select a file to get an explanation.</p>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Stop any ongoing streaming before submitting
    stop()
    handleSubmit(e)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
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
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 border-t pt-4">
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
  )
}
