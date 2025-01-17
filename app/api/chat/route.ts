import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages, data } = await req.json()
  const { fileName, fileContent } = data || {}

  const systemMessage = fileName && fileContent ?
    'You are an AI assistant that explains code. You will be given a file to analyze. ' +
    'Explain what the code does, its purpose, and any important patterns or concepts used. ' +
    'Be concise but thorough. Here is the file content:\n\n' +
    `File: ${fileName}\n\n${fileContent}`
    : 'You are a helpful assistant that explains code and helps developers understand codebases.'

  console.log('Processing file:', fileName)
  console.log('System message:', systemMessage)

  const result = streamText({
    model: openai('gpt-4'),
    system: systemMessage,
    messages,
  })

  return result.toDataStreamResponse()
}
