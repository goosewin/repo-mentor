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
}

interface SummaryResponse {
  summary: {
    projectOverview: string
    keyFeatures: string[]
    techStack: string[]
  }
  stats: RepoStats
  analyzedFiles: { path: string; reason: string }[]
}

export function RepoSummary({ repoUrl }: RepoSummaryProps) {
  const [stats, setStats] = useState<RepoStats>()
  const [summaryData, setSummaryData] = useState<SummaryResponse>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/repo/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch repo summary')
        }

        const data: SummaryResponse = await response.json()
        setSummaryData(data)
        setStats(data.stats)
      } catch (error) {
        toast.error('Failed to load repository summary')
        console.error('Error fetching summary:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [repoUrl])

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
                  <h3 className="text-lg font-semibold mb-4">Overview</h3>
                  <p className="text-muted-foreground">
                    {summaryData?.summary.projectOverview}
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

      {summaryData && (
        <>
          <Separator className="my-6" />
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Features</h3>
              <Card>
                <CardContent className="pt-6">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {summaryData.summary.keyFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
              <Card>
                <CardContent className="pt-6">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {summaryData.summary.techStack.map((tech, index) => (
                      <li key={index}>{tech}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
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
