import fs from 'fs'
import path from 'path'

interface LanguageStats {
  [key: string]: number
}

export interface RepoStats {
  languages: {
    name: string
    percentage: number
    bytes: number
  }[]
  totalBytes: number
  fileCount: number
  license?: string
  readme?: string
}

const LANGUAGE_EXTENSIONS: { [key: string]: string } = {
  // JavaScript & TypeScript
  js: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',

  // Web
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',

  // Backend
  py: 'Python',
  rb: 'Ruby',
  php: 'PHP',
  java: 'Java',
  cs: 'C#',
  go: 'Go',
  rs: 'Rust',
  cpp: 'C++',
  c: 'C',

  // Data & Config
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  xml: 'XML',

  // Others
  md: 'Markdown',
  sql: 'SQL',
  graphql: 'GraphQL',
}

async function calculateLanguageStats(repoPath: string): Promise<LanguageStats> {
  const stats: LanguageStats = {}

  async function processDirectory(dirPath: string) {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name)

      if (item.isDirectory() && !item.name.startsWith('.')) {
        await processDirectory(fullPath)
      } else if (item.isFile()) {
        const ext = path.extname(item.name).slice(1).toLowerCase()
        const language = LANGUAGE_EXTENSIONS[ext]

        if (language) {
          const fileStats = await fs.promises.stat(fullPath)
          stats[language] = (stats[language] || 0) + fileStats.size
        }
      }
    }
  }

  await processDirectory(repoPath)
  return stats
}

async function findLicense(repoPath: string): Promise<string | undefined> {
  const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license']

  for (const file of licenseFiles) {
    const licensePath = path.join(repoPath, file)
    if (fs.existsSync(licensePath)) {
      const content = await fs.promises.readFile(licensePath, 'utf-8')
      // Simple license detection based on common keywords
      if (content.includes('MIT')) return 'MIT'
      if (content.includes('Apache')) return 'Apache'
      if (content.includes('GPL')) return 'GPL'
      if (content.includes('BSD')) return 'BSD'
      return 'Other'
    }
  }

  return undefined
}

async function findReadme(repoPath: string): Promise<string | undefined> {
  const readmeFiles = ['README.md', 'README', 'readme.md', 'readme']

  for (const file of readmeFiles) {
    const readmePath = path.join(repoPath, file)
    if (fs.existsSync(readmePath)) {
      return await fs.promises.readFile(readmePath, 'utf-8')
    }
  }

  return undefined
}

export async function getRepoStats(repoPath: string): Promise<RepoStats> {
  const languageStats = await calculateLanguageStats(repoPath)
  const totalBytes = Object.values(languageStats).reduce((a, b) => a + b, 0)

  const languages = Object.entries(languageStats)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: (bytes / totalBytes) * 100
    }))
    .sort((a, b) => b.bytes - a.bytes)

  const license = await findLicense(repoPath)
  const readme = await findReadme(repoPath)

  // Count all files (excluding hidden ones)
  let fileCount = 0
  async function countFiles(dirPath: string) {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true })
    for (const item of items) {
      if (!item.name.startsWith('.')) {
        if (item.isFile()) fileCount++
        else if (item.isDirectory()) {
          await countFiles(path.join(dirPath, item.name))
        }
      }
    }
  }
  await countFiles(repoPath)

  return {
    languages,
    totalBytes,
    fileCount,
    license,
    readme
  }
} 
