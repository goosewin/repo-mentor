'use client'


interface CodeViewerProps {
  content: string
}

export function CodeViewer({ content }: CodeViewerProps) {
  return (
    <pre className="p-4 rounded bg-muted overflow-auto">
      <code>{content}</code>
    </pre>
  )
}
