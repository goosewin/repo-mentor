'use client'

import { CodeViewer } from '@/components/CodeViewer'
import { QASection } from '@/components/QASection'
import { RepoSummary } from '@/components/RepoSummary'
import { TreeView } from '@/components/TreeView'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FileNode } from '@/utils/git'
import { Github, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RepoMentor() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [files, setFiles] = useState<FileNode[]>([])
  const [fileContent, setFileContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/repo/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load repository')
      }

      const { repoPath: path, files: repoFiles } = await response.json()
      setRepoPath(path)
      setFiles(repoFiles)
      setIsLoaded(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load repository')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath)
    try {
      const response = await fetch(
        `/api/repo/file?repoPath=${encodeURIComponent(repoPath)}&filePath=${encodeURIComponent(filePath)}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to read file')
      }

      const { content } = await response.json()
      setFileContent(content)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to read file: ${filePath}`)
      setFileContent('')
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

        {isLoaded && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-3">
              <RepoSummary repoUrl={repoUrl} repoPath={repoPath} />
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>File Explorer</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <TreeView files={files} onSelectFile={handleFileSelect} />
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <Tabs defaultValue="code" className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedFile || 'File Viewer'}</CardTitle>
                    <TabsList>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="explanation">Explanation</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="code">
                    <CodeViewer content={fileContent} fileName={selectedFile} />
                  </TabsContent>
                  <TabsContent value="explanation">
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? (
                        `This file, ${selectedFile}, is a key component of the application. It [explanation would be generated here based on the file content and purpose]...`
                      ) : (
                        'Select a file to view its explanation.'
                      )}
                    </p>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            <Card className="lg:col-span-3">
              <QASection selectedFile={selectedFile} />
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
