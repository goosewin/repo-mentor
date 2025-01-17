import { openai } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful assistant.',
    messages,
  })

  return result.toDataStreamResponse()
}
