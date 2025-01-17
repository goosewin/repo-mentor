import { readFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { join } from 'path'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const repoPath = searchParams.get('repoPath')
  const filePath = searchParams.get('filePath')

  if (!repoPath || !filePath) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    // Normalize paths to handle Windows/Unix differences
    const normalizedRepoPath = repoPath.replace(/\\/g, '/')
    const normalizedFilePath = filePath.replace(/\\/g, '/')
    const fullPath = join(normalizedRepoPath, normalizedFilePath)

    // Ensure the file path doesn't try to escape the repo directory
    if (normalizedFilePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const content = await readFile(fullPath, 'utf-8')
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error reading file:', error)
    const isNotFound = error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'ENOENT'

    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: isNotFound ? 404 : 500 }
    )
  }
}

interface ExplanationResponse {
  explanation: string
  keyPoints: string[]
  suggestedImprovements?: string[]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, fileName } = body

    if (!content || !fileName) {
      return NextResponse.json(
        { error: 'Missing content or fileName in request body' },
        { status: 400 }
      )
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    const prompt = `Analyze the following code file and provide a detailed explanation. The file is named "${fileName}".

Code content:
\`\`\`${fileExtension}
${content}
\`\`\`

Please provide a JSON response with the following structure:
{
  "explanation": "A clear, detailed explanation of what this code does and its purpose",
  "keyPoints": ["List of important points about the code's functionality, patterns, or notable features"],
  "suggestedImprovements": ["Optional list of potential improvements or best practices that could be applied"]
}

Focus on explaining:
1. The main purpose and functionality
2. Key components and their interactions
3. Important patterns or techniques used
4. Dependencies and their roles
5. Any notable features or optimizations`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const content_response = completion.choices[0]?.message?.content
    if (!content_response) {
      throw new Error('No content in response')
    }

    const response: ExplanationResponse = JSON.parse(content_response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating explanation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}
