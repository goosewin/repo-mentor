'use client'

import { useState } from 'react'
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Loader2 } from 'lucide-react'

interface QASectionProps {
  selectedFile: string
}

export const QASection: React.FC<QASectionProps> = ({ selectedFile }) => {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setQaPairs([...qaPairs, { 
      question, 
      answer: `This is a sample answer for the question about ${selectedFile || 'the project'}. In a real application, this would be generated based on the file content and context.` 
    }])
    setQuestion('')
    setIsLoading(false)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Q&A Section</CardTitle>
        <CardDescription>Ask questions about the code and get explanations</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4 mb-4">
          {qaPairs.map((pair, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold text-gray-100">Q: {pair.question}</p>
              <p className="mt-1 text-gray-300">A: {pair.answer}</p>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask a question about ${selectedFile || 'the project'}...`}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || !selectedFile}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            <span className="ml-2">Ask</span>
          </Button>
        </form>
      </CardContent>
    </>
  )
}

