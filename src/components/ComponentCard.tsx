import { useState } from 'react';
import type { ComponentItem, GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: ComponentItem;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';
type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');

  const isStreaming = 'isStreaming' in component && component.isStreaming;

  if (isStreaming) {
    return (
      <div className="component-card component-card--streaming">
        <div className="card-header">
          <p className="card-prompt">{component.prompt}</p>
          <div className="streaming-indicator">
            <span className="streaming-dot" />
            생성 중...
          </div>
        </div>
        <div className="card-content">
          <CodeView code={component.streamingCode} />
        </div>
      </div>
    );
  }

  const finished = component as GeneratedComponent;

  return (
    <div className="component-card">
      <div className="card-header">
        <p className="card-prompt">{finished.prompt}</p>
        <div className="card-actions">
          <button
            className="btn-refresh"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="미리보기 새로고침"
          >
            ↻
          </button>
          <button
            className="btn-regenerate"
            onClick={() => onRegenerate(finished.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
          <button
            className="btn-remove"
            onClick={() => onRemove(finished.id)}
          >
            삭제
          </button>
        </div>
      </div>
      <div className="card-tabs">
        <button
          className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          미리보기
        </button>
        <button
          className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          코드
        </button>
      </div>
      {activeTab === 'preview' && (
        <div className="viewport-controls">
          {(['mobile', 'tablet', 'desktop'] as const).map(size => (
            <button
              key={size}
              className={`viewport-btn${viewportSize === size ? ' viewport-btn--active' : ''}`}
              onClick={() => setViewportSize(size)}
            >
              {size === 'mobile' ? '모바일' : size === 'tablet' ? '태블릿' : '데스크탑'}
            </button>
          ))}
        </div>
      )}
      <div className="card-content">
        {activeTab === 'preview' ? (
          <LivePreview key={previewKey} code={finished.code} viewportSize={viewportSize} />
        ) : (
          <CodeView code={finished.code} />
        )}
      </div>
    </div>
  );
}
