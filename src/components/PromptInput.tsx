import { useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  '호버 시 빛나는 그라데이션 버튼',
  '아바타, 이름, 소개가 있는 프로필 카드',
  '부드러운 애니메이션의 토글 스위치',
  '인기 뱃지가 있는 요금제 카드',
  '닫기 버튼이 있는 알림 토스트',
  '75%를 표시하는 원형 프로그레스 바',
];

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="prompt-section">
      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="만들고 싶은 컴포넌트를 설명해주세요..."
          className="prompt-textarea"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className="btn-generate"
          disabled={!prompt.trim() || isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner">생성 중...</span>
          ) : (
            '컴포넌트 생성'
          )}
        </button>
      </form>
      <div className="prompt-examples">
        <span className="examples-label">예시:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            className="example-chip"
            onClick={() => handleExampleClick(example)}
            type="button"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
