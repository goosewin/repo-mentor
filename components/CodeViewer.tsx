'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeViewerProps {
  file: string
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('typescript')

  useEffect(() => {
    // In a real application, this would fetch the file content from the server
    const fetchCode = async () => {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setCode(`
// This is a sample code for ${file}
import React from 'react';

const SampleComponent = () => {
  return (
    <div>
      <h1>Hello from ${file}</h1>
      <p>This is a sample component.</p>
    </div>
  );
};

export default SampleComponent;
      `)

      // Set language based on file extension
      const extension = file.split('.').pop()?.toLowerCase()
      switch (extension) {
        case 'js':
          setLanguage('javascript')
          break
        case 'ts':
        case 'tsx':
          setLanguage('typescript')
          break
        case 'jsx':
          setLanguage('jsx')
          break
        case 'css':
          setLanguage('css')
          break
        case 'html':
          setLanguage('html')
          break
        case 'json':
          setLanguage('json')
          break
        default:
          setLanguage('typescript') // Default to TypeScript
      }
    }

    if (file) {
      fetchCode()
    }
  }, [file])

  if (!file) {
    return <p className="text-gray-400">Select a file to view its content.</p>
  }

  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          backgroundColor: '#1E1E1E', // Darker background for better contrast
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

