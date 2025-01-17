'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { TreeView } from './components/TreeView'
import { CodeViewer } from './components/CodeViewer'
import { RepoSummary } from './components/RepoSummary'
import { QASection } from './components/QASection'
import { Github, Loader2 } from 'lucide-react'

export default function RepoMentor() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulating repo loading
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsLoaded(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Repo Mentor</h1>
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
              <RepoSummary />
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>File Explorer</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <TreeView onSelectFile={setSelectedFile} />
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
                    <CodeViewer file={selectedFile} />
                  </TabsContent>
                  <TabsContent value="explanation">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
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

