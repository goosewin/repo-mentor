import { simpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
}

export interface Language {
  name: string
  percentage: number
  bytes: number
}

interface GitHubLanguageResponse {
  [key: string]: number
}

export function parseGitHubUrl(url: string | undefined): RepoInfo {
  if (!url) {
    throw new Error('GitHub URL is required');
  }

  // Handle different GitHub URL formats
  const urlPattern = /github\.com[\/:]([^\/]+)\/([^\/]+?)(\.git)?$/;
  const match = url.match(urlPattern);
  
  if (!match) {
    throw new Error('Invalid GitHub URL. Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
  }
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', ''),
    branch: 'main' // Default to main
  };
}

export async function cloneRepository(url: string | undefined): Promise<{ repoPath: string; repoInfo: RepoInfo }> {
  if (!url) {
    throw new Error('GitHub URL is required');
  }

  const repoInfo = parseGitHubUrl(url);
  
  // Create a temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-mentor-'));
  const git = simpleGit();
  
  try {
    // Clone the repository
    await git.clone(url, tempDir);
    return { repoPath: tempDir, repoInfo };
  } catch (error) {
    // Clean up the temp directory if clone fails
    await cleanup(tempDir);
    throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getLanguages(owner: string, repo: string): Promise<{ languages: Language[], totalBytes: number }> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json() as GitHubLanguageResponse;
    
    const totalBytes = Object.values(data).reduce((a, b) => a + b, 0);
    
    const languages = Object.entries(data).map(([name, bytes]) => ({
      name,
      percentage: (bytes / totalBytes) * 100,
      bytes,
    }));

    return { languages, totalBytes };
  } catch (error) {
    console.error('Error getting languages:', error);
    return { languages: [], totalBytes: 0 };
  }
}

export async function getReadmeContent(owner: string, repo: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error getting README:', error);
    return undefined;
  }
}

export async function getLicense(owner: string, repo: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/license`);
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    return data.license?.name;
  } catch (error) {
    console.error('Error getting license:', error);
    return undefined;
  }
}

export async function getFileCount(repoPath: string): Promise<number> {
  let count = 0;
  
  async function countFiles(dir: string) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      if (file === '.git' || file === 'node_modules') continue;
      
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await countFiles(fullPath);
      } else {
        count++;
      }
    }
  }
  
  await countFiles(repoPath);
  return count;
}

// Clean up cloned repositories
export async function cleanup(repoPath: string): Promise<void> {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up repository:', error);
  }
}
