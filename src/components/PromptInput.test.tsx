import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput - 글자 수 카운터', () => {
  it('초기에 0 글자를 표시해야 한다', () => {
    const handleGenerate = () => {};
    render(<PromptInput onGenerate={handleGenerate} isLoading={false} />);

    expect(screen.getByText('0 글자')).toBeInTheDocument();
  });

  it('textarea에 글자를 입력하면 카운터가 업데이트된다', async () => {
    const user = userEvent.setup();
    const handleGenerate = () => {};
    render(<PromptInput onGenerate={handleGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, 'hello');

    expect(screen.getByText('5 글자')).toBeInTheDocument();
  });

  it('textarea를 비우면 0 글자로 돌아간다', async () => {
    const user = userEvent.setup();
    const handleGenerate = () => {};
    render(<PromptInput onGenerate={handleGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');

    // 입력
    await user.type(textarea, 'test');
    expect(screen.getByText('4 글자')).toBeInTheDocument();

    // 전체 선택 후 삭제
    await user.clear(textarea);
    expect(screen.getByText('0 글자')).toBeInTheDocument();
  });

  it('한글도 정확하게 계산한다', async () => {
    const user = userEvent.setup();
    const handleGenerate = () => {};
    render(<PromptInput onGenerate={handleGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, '안녕하세요');

    expect(screen.getByText('5 글자')).toBeInTheDocument();
  });

  it('예시를 클릭하면 카운터가 예시 글자 수로 업데이트된다', async () => {
    const user = userEvent.setup();
    const handleGenerate = () => {};
    render(<PromptInput onGenerate={handleGenerate} isLoading={false} />);

    // 첫 번째 예시 버튼 클릭
    const exampleButton = screen.getAllByRole('button', { name: /커서가 깜빡이며/ })[0];
    await user.click(exampleButton);

    // 예시 텍스트: '커서가 깜빡이며 한 글자씩 타이핑되는 애니메이션 텍스트. 여러 문장을 순환하며 반복'
    // 글자 수: 46
    expect(screen.getByText('46 글자')).toBeInTheDocument();
  });
});
