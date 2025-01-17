'use client'

import { cn } from '@/lib/utils'
import { Message as AIMessage } from 'ai'
import { Bot, User } from 'lucide-react'

export function Message({ role, content }: AIMessage) {
  return (
    <div className={cn('flex items-start gap-4 p-4', role === 'assistant' ? 'bg-muted/50' : 'bg-background')}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
        {role === 'assistant' ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="leading-normal">
          {content}
        </p>
      </div>
    </div>
  )
} 
