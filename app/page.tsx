'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Github, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+?)(?:\.git)?$/)
      if (!match) {
        throw new Error('Invalid GitHub repository URL')
      }

      const [owner, repo] = match[1].split('/')
      router.push(`/repo/${owner}/${repo}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid repository URL')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Repo Mentor</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter GitHub repo URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Load Repo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
