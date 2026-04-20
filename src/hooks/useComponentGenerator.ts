import { useState, useCallback } from 'react';
import type { ComponentItem, GeneratedComponent, Provider, SSEChunk, StreamingComponent } from '../types';

interface UseComponentGeneratorReturn {
  components: ComponentItem[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const streamingId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const createdAt = new Date();

    const streamingItem: StreamingComponent = {
      id: streamingId,
      prompt,
      streamingCode: '',
      isStreaming: true,
      createdAt,
    };

    setComponents((prev) => [streamingItem, ...prev]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event: SSEChunk = JSON.parse(raw);

            if (event.type === 'chunk') {
              setComponents((prev) =>
                prev.map((c) =>
                  c.id === streamingId && 'isStreaming' in c
                    ? { ...c, streamingCode: c.streamingCode + event.text }
                    : c
                )
              );
            } else if (event.type === 'done') {
              const finishedComponent: GeneratedComponent = {
                id: streamingId,
                prompt,
                code: event.finalCode,
                createdAt,
              };
              setComponents((prev) => prev.map((c) => (c.id === streamingId ? finishedComponent : c)));
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            console.warn('SSE parse error:', parseErr, 'raw:', raw);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setComponents((prev) => prev.filter((c) => c.id !== streamingId));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
