import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
}

type Tab = 'preview' | 'code';

export function ComponentCard({ component, onRemove }: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  return (
    <div className="component-card">
      <div className="card-header">
        <p className="card-prompt">{component.prompt}</p>
        <button
          className="btn-remove"
          onClick={() => onRemove(component.id)}
        >
          삭제
        </button>
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
      <div className="card-content">
        {activeTab === 'preview' ? (
          <LivePreview code={component.code} />
        ) : (
          <CodeView code={component.code} />
        )}
      </div>
    </div>
  );
}
