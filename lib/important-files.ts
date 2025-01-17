import fs from 'fs/promises';
import path from 'path';

export interface ImportantFile {
  path: string;
  reason: string;
  content: string;
}

const IMPORTANT_FILES = [
  {
    path: 'README.md',
    reason: 'Contains project description, features, setup instructions'
  },
  {
    path: 'package.json',
    reason: 'Shows dependencies, scripts, and project metadata'
  },
  {
    path: '.env.example',
    reason: 'Shows required environment variables'
  },
  {
    path: 'tsconfig.json',
    reason: 'Indicates TypeScript configuration and project structure'
  },
  {
    path: 'app/layout.tsx',
    reason: 'Main layout structure'
  },
  {
    path: 'app/page.tsx',
    reason: 'Main page/entry point'
  }
];

const API_FOLDER = 'app/api';

export async function findImportantFiles(repoPath: string): Promise<ImportantFile[]> {
  const importantFiles: ImportantFile[] = [];

  // Check for predefined important files
  for (const file of IMPORTANT_FILES) {
    try {
      const fullPath = path.join(repoPath, file.path);
      const content = await fs.readFile(fullPath, 'utf-8');
      importantFiles.push({
        path: file.path,
        reason: file.reason,
        content: content
      });
    } catch (error) {
      // Skip if file doesn't exist
      console.log(`File ${file.path} not found`);
    }
  }

  // Check API routes
  try {
    const apiPath = path.join(repoPath, API_FOLDER);
    const apiFiles = await findApiRoutes(apiPath);
    importantFiles.push(...apiFiles);
  } catch (error) {
    console.log('API folder not found');
  }

  return importantFiles;
}

async function findApiRoutes(apiPath: string): Promise<ImportantFile[]> {
  const apiFiles: ImportantFile[] = [];

  try {
    const files = await fs.readdir(apiPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(apiPath, file.name);
      
      if (file.isDirectory()) {
        // Recursively check subdirectories
        const subFiles = await findApiRoutes(fullPath);
        apiFiles.push(...subFiles);
      } else if (file.name === 'route.ts' || file.name === 'route.js') {
        const content = await fs.readFile(fullPath, 'utf-8');
        apiFiles.push({
          path: path.relative(apiPath, fullPath),
          reason: 'API route definition',
          content: content
        });
      }
    }
  } catch (error) {
    console.error('Error reading API directory:', error);
  }

  return apiFiles;
}
