import { GitService } from '@/utils/git'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repoPath = searchParams.get('repoPath')
    const filePath = searchParams.get('filePath')

    if (!repoPath || !filePath) {
      return NextResponse.json(
        { error: 'Missing repoPath or filePath parameter' },
        { status: 400 }
      )
    }

    const gitService = new GitService()
    const content = await gitService.readFile(repoPath, filePath)

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: 500 }
    )
  }
} 
