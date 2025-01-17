'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'

interface FileExplainerProps {
  fileName: string
  fileContent: string
}

export function FileExplainer({ fileName, fileContent }: FileExplainerProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      fileName,
      fileContent
    },
    initialMessages: fileName ? [
      {
        id: 'init',
        role: 'user',
        content: 'Please explain this file'
      }
    ] : []
  })

  if (!fileName) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Select a file to get an explanation.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'p-4 rounded-lg',
              m.role === 'user' ? 'bg-primary text-primary-foreground ml-8' : 'bg-muted mr-8'
            )}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}
