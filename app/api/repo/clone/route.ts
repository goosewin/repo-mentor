import { GitService } from '@/utils/git'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json()
    const gitService = new GitService()
    const repoPath = await gitService.cloneRepo(repoUrl)
    const files = await gitService.listFiles(repoPath)

    return NextResponse.json({ repoPath, files })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clone repository' },
      { status: 500 }
    )
  }
} 
