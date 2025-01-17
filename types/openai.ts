export interface OpenAIError extends Error {
  name: string;
  message: string;
  stack?: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
