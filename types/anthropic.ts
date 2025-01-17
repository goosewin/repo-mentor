export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolBlock {
  type: 'tool';
  tool: unknown;
}

export type AnthropicContentBlock = TextBlock | ToolBlock;

export interface AnthropicMessage {
  content: AnthropicContentBlock[];
  role: string;
  model: string;
}

export interface AnthropicError extends Error {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
}