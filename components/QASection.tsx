'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { Bot, SendHorizontal, User } from "lucide-react"
import { memo } from 'react'

interface QASectionProps {
  selectedFile: string
}

interface ChatMessage {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
}

function MessageComponent({ message }: { message: ChatMessage }) {
  return (
    <div className={cn('flex items-start gap-4 p-4',
      message.role === 'assistant' ? 'bg-muted/50' : 'bg-background'
    )}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
        {message.role === 'assistant' ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="leading-normal whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  )
}

const Messages = memo(function Messages({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageComponent key={message.id} message={message} />
      ))}
    </div>
  )
})

export function QASection({ selectedFile }: QASectionProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      selectedFile
    }
  })

  if (!selectedFile) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Select a file to ask questions about it.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-4">
        {messages.length > 0 ? (
          <Messages messages={messages as ChatMessage[]} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Ask questions about the selected file.</p>
          </div>
        )}
      </div>

      <div className="border-t bg-background pt-2">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about this file..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
