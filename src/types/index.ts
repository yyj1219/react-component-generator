export type Provider = 'anthropic' | 'google';

export interface GeneratedComponent {
  id: string;
  prompt: string;
  code: string;
  createdAt: Date;
}

export interface StreamingComponent {
  id: string;
  prompt: string;
  streamingCode: string;
  isStreaming: true;
  createdAt: Date;
}

export type ComponentItem = StreamingComponent | GeneratedComponent;

export type SSEChunk =
  | { type: 'chunk'; text: string }
  | { type: 'done'; finalCode: string }
  | { type: 'error'; message: string };
