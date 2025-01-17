'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { RepoStats } from '@/lib/stats'
import { FileText, GitFork, Github, Scale } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RepoSummaryProps {
  repoUrl: string
  repoPath: string
}

export function RepoSummary({ repoUrl, repoPath }: RepoSummaryProps) {
  const [stats, setStats] = useState<RepoStats>()
  const [summary, setSummary] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/repo/stats?repoPath=${encodeURIComponent(repoPath)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch repo stats')
        }
        const data = await response.json()
        setStats(data)

        // Generate summary using the stats
        const summaryResponse = await fetch('/api/repo/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        if (summaryResponse.ok) {
          const { summary } = await summaryResponse.json()
          setSummary(summary)
        }
      } catch {
        toast.error('Failed to load repository statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [repoPath])

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{repoUrl.split('/').slice(-2).join('/')}</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details" className="border-none">
            <div className="flex justify-end">
              <AccordionTrigger className="hover:no-underline py-0 w-auto">
                <span className="text-sm font-medium">See repo details</span>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-muted-foreground">
                    This repository appears to be a modern web application built with cutting-edge technologies.
                    It demonstrates best practices in software architecture and includes comprehensive documentation.
                    The codebase is well-organized and follows industry standards for maintainability and scalability.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Languages</h3>
                  <div className="space-y-4">
                    {stats?.languages.map(lang => (
                      <div key={lang.name}>
                        <div className="flex justify-between mb-1">
                          <span>{lang.name}</span>
                          <span className="text-muted-foreground">{lang.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={lang.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Repository Info</h3>
                  <div className="space-y-4">
                    {stats?.license && (
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <span>License: {stats.license}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Files: {stats?.fileCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-muted-foreground" />
                      <span>Size: {formatBytes(stats?.totalBytes || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {summary && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-4">Repository Summary</h3>
            <Card>
              <CardContent className="pt-6 text-muted-foreground">
                <p className="whitespace-pre-wrap">{summary}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
