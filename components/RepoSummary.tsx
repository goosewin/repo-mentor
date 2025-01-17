
interface RepoSummaryProps {
  repoUrl: string
  repoPath: string
}

export function RepoSummary({ repoUrl, repoPath }: RepoSummaryProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Repository Summary</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Repository URL</h3>
          <p className="text-muted-foreground">{repoUrl}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Local Path</h3>
          <p className="text-muted-foreground">{repoPath}</p>
        </div>
      </div>
    </div>
  )
}
