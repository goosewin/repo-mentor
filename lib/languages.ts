type LanguageMap = {
  [key: string]: string
}

const LANGUAGE_MAP: LanguageMap = {
  // JavaScript & TypeScript
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',

  // Web
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',

  // Backend
  py: 'python',
  rb: 'ruby',
  php: 'php',
  java: 'java',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',

  // Data & Config
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  xml: 'xml',

  // Shell
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',

  // Others
  md: 'markdown',
  sql: 'sql',
  graphql: 'graphql',
  dockerfile: 'dockerfile',
}

export function detectLanguage(fileName: string): string {
  // Handle special cases first
  if (fileName.toLowerCase() === 'dockerfile') {
    return 'dockerfile'
  }

  // Get file extension
  const extension = fileName.split('.').pop()?.toLowerCase() || ''

  // Return mapped language or fallback to text
  return LANGUAGE_MAP[extension] || 'text'
} 
