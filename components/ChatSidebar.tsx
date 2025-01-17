'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { cn } from '@/lib/utils'
import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { AutoResizeTextarea } from './AutoResizeTextarea'

export function ChatSidebar({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void append({ content: input, role: 'user' })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const toggleSidebar = () => setIsExpanded(!isExpanded)

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed right-0 top-0 h-screen transition-all duration-300 ease-in-out',
          isExpanded ? 'w-80' : 'w-12',
          className
        )}
        {...props}
      >
        <Button
          onClick={toggleSidebar}
          className="absolute -left-3 top-4 z-10 h-6 w-6 rounded-full p-0"
        >
          {isExpanded ? '>' : '<'}
        </Button>
        <div className="flex h-full flex-col bg-gray-100 p-4">
          <h2 className="mb-4 text-lg font-semibold">Chat Assistant</h2>
          <div className="flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'mb-2 rounded-lg p-2 text-sm',
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative">
              <AutoResizeTextarea
                value={input}
                onChange={(value) => setInput(value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full rounded-lg border border-gray-300 p-2 pr-8"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-1 right-1 h-6 w-6 rounded-full p-0"
                  >
                    <ArrowUpIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={12}>Send</TooltipContent>
              </Tooltip>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  )
}

