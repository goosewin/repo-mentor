import { getRepoStats } from '@/lib/stats'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repoPath = searchParams.get('repoPath')

    if (!repoPath) {
      return NextResponse.json(
        { error: 'Missing repoPath parameter' },
        { status: 400 }
      )
    }

    const stats = await getRepoStats(repoPath)
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get repo stats' },
      { status: 500 }
    )
  }
} 
