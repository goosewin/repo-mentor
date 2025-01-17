import type { RepoStats } from '@/lib/stats'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { readme, languages, fileCount, license } = (await request.json()) as RepoStats

    const prompt = `Given the following repository information, provide a concise summary (max 3 paragraphs) that explains the purpose and key aspects of this project:

Repository Stats:
- Number of files: ${fileCount}
- Main languages: ${languages.slice(0, 3).map(lang => lang.name).join(', ')}
${license ? `- License: ${license}` : ''}

README content:
${readme || '[No README provided]'}

Focus on:
1. The main purpose and functionality of the project
2. Key technologies used
3. Notable features or characteristics

Keep it professional but easy to understand.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 300,
    })

    return NextResponse.json({
      summary: completion.choices[0].message.content
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    )
  }
} 
