// app/api/analyze/overview/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Check for API key at startup
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const README_CONTENT = `Hackomate is a comprehensive platform designed to revolutionize hackathon team formation and project management. It uses AI to match participants based on skills and interests, generate innovative project ideas, and facilitate real-time collaboration between teams and sponsors.

Features
* AI-Powered Project Generation: Create diverse project ideas based on hackathon themes and sponsors
* Intelligent Team Formation: Match participants based on skills and interests
* Sponsor Integration: Real-time project feedback and resource access (Upcoming)
* Project Management: Detailed project pages and team collaboration tools (Upcoming)

Built With
* Frontend - Next.js 14, TypeScript and Tailwind CSS
* Backend - Supabase and Zilliz Cloud
* AI Integration - OpenAI GPT-4 and Embeddings
* Infrastructure - Vercel, Supabase Platform, Zilliz Cloud`;

export async function POST() {
  console.log('API route hit - Starting analysis');
  console.log('API Key present:', !!process.env.OPENAI_API_KEY);
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing from environment');
    }

    console.log('Making request to OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{
        role: "user",
        content: `Analyze this project README and provide:
1. Project Overview - Brief description of what the project does
2. Key Features - Main functionalities and capabilities
3. Tech Stack - Technologies, frameworks, and libraries used

README Content:
${README_CONTENT}

Format the response as JSON:
{
  "projectOverview": "string",
  "keyFeatures": ["string"],
  "techStack": ["string"]
}`
      }],
      response_format: { type: "json_object" }
    });

    console.log('Received response from OpenAI API');
    
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }
    
    const parsedResponse = JSON.parse(content);
    return NextResponse.json(parsedResponse);
    
  } catch (error: unknown) {
    console.error('Detailed error:', {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json({ 
      error: 'Failed to analyze repository',
      details: error instanceof Error ? error.message : 'An unknown error occurred',
      type: error instanceof Error ? error.name : 'UnknownError'
    }, { 
      status: error instanceof Error && error.message.includes('401') ? 401 : 500 
    });
  }
}