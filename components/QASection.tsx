'use client'


interface QASectionProps {
  selectedFile: string
}

export function QASection({ selectedFile }: QASectionProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ask Questions</h2>
      {selectedFile ? (
        <p className="text-muted-foreground">
          Ask questions about {selectedFile} and its functionality.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Select a file to ask questions about its code and functionality.
        </p>
      )}
    </div>
  )
}
