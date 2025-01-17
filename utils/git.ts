import fs from 'fs';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// This service should only be used on the server side
export class GitService {
  private git: SimpleGit;
  private reposDir: string;

  constructor() {
    this.git = simpleGit();
    // Store repos in a 'repos' directory at project root
    this.reposDir = path.join(process.cwd(), 'repos');
    this.ensureReposDirExists();
  }

  private ensureReposDirExists() {
    if (!fs.existsSync(this.reposDir)) {
      fs.mkdirSync(this.reposDir, { recursive: true });
    }
  }

  private getRepoPath(repoName: string): string {
    return path.join(this.reposDir, repoName);
  }

  async cloneRepo(repoUrl: string): Promise<string> {
    const repoName = this.extractRepoName(repoUrl);
    const repoPath = this.getRepoPath(repoName);

    // If repo exists, just return the path
    if (fs.existsSync(repoPath)) {
      try {
        // Try to pull latest changes
        const git = simpleGit(repoPath);
        await git.pull();
      } catch {
        // Ignore pull errors, just use existing repo
      }
      return repoPath;
    }

    try {
      await this.git.clone(repoUrl, repoPath);
      return repoPath;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractRepoName(repoUrl: string): string {
    // Extract repo name from URL (e.g., 'owner/repo' from 'https://github.com/owner/repo')
    const match = repoUrl.match(/\/([^\/]+\/[^\/]+?)(?:\.git)?$/);
    if (!match) {
      throw new Error('Invalid repository URL');
    }
    return match[1].replace('/', '-');
  }

  async listFiles(repoPath: string, dir: string = '.'): Promise<FileNode[]> {
    const fullPath = path.join(repoPath, dir);

    try {
      const items = await fs.promises.readdir(fullPath, { withFileTypes: true });
      const nodes: FileNode[] = [];

      for (const item of items) {
        const relativePath = path.join(dir, item.name);

        if (item.isDirectory()) {
          const children = await this.listFiles(repoPath, relativePath);
          nodes.push({
            name: item.name,
            path: relativePath,
            type: 'directory',
            children
          });
        } else {
          nodes.push({
            name: item.name,
            path: relativePath,
            type: 'file'
          });
        }
      }

      // Sort directories first, then files, both alphabetically
      return nodes.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
      });
    } catch (error) {
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async readFile(repoPath: string, filePath: string): Promise<string> {
    const fullPath = path.join(repoPath, filePath);

    try {
      const stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory()) {
        throw new Error('Cannot read directory as file');
      }
      return await fs.promises.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
