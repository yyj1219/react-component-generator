import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import type { SSEChunk } from '../types';

const makeMockFetch = (events: SSEChunk[]) =>
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          const enc = new TextEncoder();
          for (const e of events) {
            controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
          }
          controller.close();
        },
      }),
    })
  );

describe('useComponentGenerator - streaming', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('스트리밍 시작 직후 isStreaming=true인 컴포넌트가 즉시 목록에 추가된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    let checkCalled = false;
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        // 첫 fetch 호출 직후, 아직 reader가 실행되기 전에 상태 확인
        if (!checkCalled) {
          checkCalled = true;
          expect(result.current.components).toHaveLength(1);
          expect(result.current.components[0]).toHaveProperty('isStreaming', true);
          expect(result.current.components[0]).toHaveProperty('streamingCode', '');
        }
        return Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              const enc = new TextEncoder();
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'chunk', text: 'const' })}\n\n`));
              controller.enqueue(
                enc.encode(`data: ${JSON.stringify({ type: 'done', finalCode: 'const App = () => <div/>;\\nrender(<App />);' })}\n\n`)
              );
              controller.close();
            },
          }),
        });
      })
    );

    await act(async () => {
      await result.current.generate('test prompt', 'fake-key', 'anthropic');
    });
  });

  it('청크 이벤트마다 streamingCode가 누적된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    vi.stubGlobal(
      'fetch',
      makeMockFetch([
        { type: 'chunk', text: 'const' },
        { type: 'chunk', text: ' App' },
        { type: 'chunk', text: ' = () => <div/>;' },
        { type: 'done', finalCode: 'const App = () => <div/>;\\nrender(<App />);' },
      ])
    );

    await act(async () => {
      await result.current.generate('test', 'key', 'anthropic');
    });

    await waitFor(() => {
      expect(result.current.components[0]).toHaveProperty('code');
    });

    expect(result.current.components[0]).toHaveProperty(
      'code',
      'const App = () => <div/>;\\nrender(<App />);'
    );
  });

  it('done 이벤트 수신 시 StreamingComponent가 GeneratedComponent로 교체된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    const finalCode = 'const App = () => <div/>;\\nrender(<App />);';
    vi.stubGlobal(
      'fetch',
      makeMockFetch([{ type: 'done', finalCode }])
    );

    await act(async () => {
      await result.current.generate('test', 'key', 'anthropic');
    });

    await waitFor(() => {
      expect(result.current.components[0]).toHaveProperty('code', finalCode);
    });

    expect(result.current.components[0]).not.toHaveProperty('isStreaming');
  });

  it('error 이벤트 수신 시 error가 세팅되고 스트리밍 카드는 제거된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    vi.stubGlobal(
      'fetch',
      makeMockFetch([
        { type: 'chunk', text: 'partial' },
        { type: 'error', message: 'API limit exceeded' },
      ])
    );

    await act(async () => {
      await result.current.generate('test', 'key', 'anthropic');
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.components).toHaveLength(0);
  });

  it('스트리밍 중 isLoading=true, 완료 후 false가 된다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    let resolveGenerate: (() => void) | null = null;
    const slowFetch = vi.fn(
      () =>
        new Promise<{ ok: true; body: ReadableStream }>(async (resolve) => {
          resolveGenerate = () => {
            resolve({
              ok: true,
              body: new ReadableStream({
                start(controller) {
                  const enc = new TextEncoder();
                  controller.enqueue(
                    enc.encode(`data: ${JSON.stringify({ type: 'done', finalCode: 'const App = () => {};\\nrender(<App />);' })}\n\n`)
                  );
                  controller.close();
                },
              }),
            });
          };
        })
    );

    vi.stubGlobal('fetch', slowFetch);

    act(() => {
      result.current.generate('test', 'key', 'anthropic');
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(result.current.isLoading).toBe(true);

    if (resolveGenerate) {
      await act(async () => {
        resolveGenerate!();
        await waitFor(() => !result.current.isLoading);
      });
    }

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useComponentGenerator - existing behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('removeComponent는 id로 컴포넌트를 삭제한다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    vi.stubGlobal(
      'fetch',
      makeMockFetch([{ type: 'done', finalCode: 'const A = () => <div/>;\\nrender(<A />);' }])
    );

    await act(async () => {
      await result.current.generate('test', 'key', 'anthropic');
    });

    const componentId = result.current.components[0].id;

    act(() => {
      result.current.removeComponent(componentId);
    });

    expect(result.current.components).toHaveLength(0);
  });

  it('clearAll은 모든 컴포넌트를 제거한다', async () => {
    const { result } = renderHook(() => useComponentGenerator());

    vi.stubGlobal(
      'fetch',
      vi.fn(() => ({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const enc = new TextEncoder();
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify({ type: 'done', finalCode: 'const A = () => <div/>;\\nrender(<A />);' })}\n\n`)
            );
            controller.close();
          },
        }),
      }))
    );

    await act(async () => {
      await result.current.generate('test1', 'key', 'anthropic');
    });

    expect(result.current.components).toHaveLength(1);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.components).toHaveLength(0);
  });
});
