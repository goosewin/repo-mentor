'use client'

import { CodeViewer } from '@/components/CodeViewer'
import { RepoSummary } from '@/components/RepoSummary'
import { SidebarChat } from '@/components/SidebarChat'
import { TreeView } from '@/components/TreeView'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { FileNode } from '@/utils/git'
import { PanelLeftOpen, PanelRightOpen } from "lucide-react"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function RepoPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [files, setFiles] = useState<FileNode[]>([])
  const [fileContent, setFileContent] = useState('')
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false)

  // Extract owner and repo from slug
  const slug = Array.isArray(params.slug) ? params.slug : [params.slug]
  const [owner, repo] = slug
  const repoUrl = `https://github.com/${owner}/${repo}`

  useEffect(() => {
    const loadRepo = async () => {
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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load repository')
      } finally {
        setIsLoading(false)
      }
    }

    loadRepo()
  }, [repoUrl])

  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath)
    setFileContent('') // Clear content immediately when selecting new file

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

      // Only trigger explanation after content is set
      if (content) {
        const explanationResponse = await fetch('/api/repo/file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            fileName: filePath.split('/').pop() || filePath
          })
        })

        if (!explanationResponse.ok) {
          const data = await explanationResponse.json()
          throw new Error(data.error || 'Failed to generate explanation')
        }
      }

    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : `Failed to read file: ${filePath}`)
      setFileContent('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-md">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-foreground">Repo Mentor</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading repository...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">

          <Card>
            <CardContent className="p-0">
              <RepoSummary repoUrl={repoUrl} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* File Explorer */}
            <Card className={`${isExplorerCollapsed ? 'lg:col-span-1' : 'lg:col-span-2'} transition-all duration-300`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  {!isExplorerCollapsed && <CardTitle>File Explorer</CardTitle>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
                  >
                    {isExplorerCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[700px] pr-4">
                  <TreeView
                    files={files}
                    onSelectFile={handleFileSelect}
                    isCollapsed={isExplorerCollapsed}
                  />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Code Viewer */}
            <Card className={`${isExplorerCollapsed ? 'lg:col-span-7' : 'lg:col-span-6'} transition-all duration-300`}>
              <Tabs defaultValue="code" className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedFile || 'File Viewer'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="code">
                    <CodeViewer content={fileContent} fileName={selectedFile} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* Chat Section */}
            <Card className={`${isExplorerCollapsed ? 'lg:col-span-4' : 'lg:col-span-4'} transition-all duration-300`}>
              <CardHeader className="flex-none">
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="px-6 pb-6">
                    <SidebarChat fileName={selectedFile} fileContent={fileContent} />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 
