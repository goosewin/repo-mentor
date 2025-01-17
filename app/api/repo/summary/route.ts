import {
  cleanup,
  cloneRepository,
  getFileCount,
  getLanguages,
  getLicense,
  getReadmeContent,
  type Language
} from '@/lib/github';
import { findImportantFiles } from '@/lib/important-files';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface RequestBody {
  repoUrl: string;  // GitHub repository URL
}

interface RepoStats {
  languages: Language[]
  totalBytes: number
  fileCount: number
  license?: string
  readme?: string
}

interface SummaryResponse {
  summary: {
    projectOverview: string;
    keyFeatures: string[];
    techStack: string[];
  };
  stats: RepoStats;
  analyzedFiles: { path: string; reason: string }[];
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request): Promise<NextResponse> {
  let repoPath: string | undefined;

  try {
    // Validate request body
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      throw new Error('Request body must be a JSON object');
    }

    const { repoUrl } = body as RequestBody;
    if (!repoUrl || typeof repoUrl !== 'string') {
      throw new Error('repoUrl is required and must be a string');
    }

    if (!repoUrl.includes('github.com')) {
      throw new Error('Only GitHub repositories are supported');
    }

    console.log('Cloning repository:', repoUrl);
    const { repoPath: clonedPath, repoInfo } = await cloneRepository(repoUrl);
    repoPath = clonedPath;

    // Gather repository information
    console.log('Gathering repository information...');
    const [{ languages, totalBytes }, readme, license, fileCount] = await Promise.all([
      getLanguages(repoInfo.owner, repoInfo.repo),
      getReadmeContent(repoInfo.owner, repoInfo.repo),
      getLicense(repoInfo.owner, repoInfo.repo),
      getFileCount(clonedPath)
    ]);

    const stats: RepoStats = {
      languages,
      totalBytes,
      fileCount,
      license,
      readme
    };

    // Find important files in the repository
    console.log('Finding important files...');
    const importantFiles = await findImportantFiles(clonedPath);
    console.log(`Found ${importantFiles.length} important files`);

    const codebaseContent = importantFiles
      .map(file => `File: ${file.path} (${file.reason})\n\`\`\`\n${file.content}\n\`\`\``)
      .join('\n\n');

    const prompt = `Analyze this GitHub repository and provide a comprehensive summary:

Repository Stats:
- Number of files: ${fileCount}
- Languages: ${languages.map(lang => `${lang.name} (${lang.percentage.toFixed(1)}%)`).join(', ')}
${license ? `- License: ${license}` : ''}

README content:
${readme || '[No README provided]'}

Important code files:
${codebaseContent}

Please provide a JSON response with the following structure:
{
  "projectOverview": "A concise description of what the project does and its main purpose",
  "keyFeatures": ["List of main functionalities and capabilities"],
  "techStack": ["List of technologies, frameworks, and tools used in the project"]
}

Focus on providing accurate, technical insights based on the actual code and documentation provided.`;

    console.log('Making request to OpenAI API...');

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const response: SummaryResponse = {
      summary: JSON.parse(content),
      stats,
      analyzedFiles: importantFiles.map(f => ({ path: f.path, reason: f.reason }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Failed to generate repository summary',
        details: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  } finally {
    // Clean up cloned repository
    if (repoPath) {
      await cleanup(repoPath);
    }
  }
}
