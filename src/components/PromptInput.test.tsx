import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput - onGenerate 호출', () => {
  it('프롬프트 입력 후 생성 버튼 클릭 시 onGenerate가 올바른 인자로 호출되어야 한다', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, 'test prompt');

    const button = screen.getByRole('button', { name: '컴포넌트 생성' });
    await user.click(button);

    expect(onGenerate).toHaveBeenCalledWith('test prompt');
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('공백만 포함된 입력은 제출하지 않아야 한다', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, '   ');

    const button = screen.getByRole('button', { name: '컴포넌트 생성' });
    // 버튼이 disabled 상태여야 함
    expect(button).toBeDisabled();

    // 시도해도 클릭이 작동하지 않음
    await user.click(button);
    expect(onGenerate).not.toHaveBeenCalled();
  });
});

describe('PromptInput - isLoading 상태', () => {
  it('isLoading={true}일 때 버튼이 disabled 상태여야 한다', () => {
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={true} />);

    const button = screen.getByRole('button', { name: /생성|생성 중/i });
    expect(button).toBeDisabled();
  });

  it('isLoading={true}일 때 버튼 텍스트가 "생성 중..."으로 변경되어야 한다', () => {
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={true} />);

    const button = screen.getByRole('button', { name: /생성 중/i });
    expect(button).toHaveTextContent('생성 중...');
  });

  it('isLoading={true}일 때 유효한 프롬프트가 있어도 onGenerate가 호출되지 않아야 한다', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={true} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, 'valid prompt');

    const button = screen.getByRole('button', { name: /생성 중/i });
    await user.click(button);

    expect(onGenerate).not.toHaveBeenCalled();
  });
});

describe('PromptInput - Ctrl+Enter 단축키', () => {
  it('Ctrl+Enter 입력 시 onGenerate가 호출되어야 한다', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, 'test prompt');

    // Ctrl+Enter 시뮬레이션
    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(onGenerate).toHaveBeenCalledWith('test prompt');
  });

  it('Command+Enter(Mac) 입력 시 onGenerate가 호출되어야 한다', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    const textarea = screen.getByPlaceholderText('만들고 싶은 컴포넌트를 설명해주세요...');
    await user.type(textarea, 'test prompt');

    // Command+Enter 시뮬레이션 (Meta는 Command 키)
    await user.keyboard('{Meta>}{Enter}{/Meta}');

    expect(onGenerate).toHaveBeenCalledWith('test prompt');
  });
});
