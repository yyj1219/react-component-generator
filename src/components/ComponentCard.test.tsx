import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentCard } from './ComponentCard';
import type { GeneratedComponent } from '../types';

const mockComponent: GeneratedComponent = {
  id: '1',
  prompt: 'Create a button',
  code: 'render(<button>Click me</button>)',
  createdAt: new Date(),
};

describe('ComponentCard - Delete Button', () => {
  it('calls onRemove with component id when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveMock = vi.fn();
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={onRemoveMock}
        onRegenerate={vi.fn()}
        isLoading={false}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /삭제/ });
    await user.click(deleteBtn);

    expect(onRemoveMock).toHaveBeenCalledWith(mockComponent.id);
  });
});

describe('ComponentCard - Regenerate Button', () => {
  it('calls onRegenerate with component prompt when regenerate button is clicked', async () => {
    const user = userEvent.setup();
    const onRegenerateMock = vi.fn();
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={onRegenerateMock}
        isLoading={false}
      />
    );

    const regenerateBtn = screen.getByRole('button', { name: /재생성/ });
    await user.click(regenerateBtn);

    expect(onRegenerateMock).toHaveBeenCalledWith(mockComponent.prompt);
  });
});

describe('ComponentCard - Loading State', () => {
  it('disables regenerate button when isLoading is true', () => {
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={true}
      />
    );

    const regenerateBtn = screen.getByRole('button', { name: /생성 중/ });
    expect(regenerateBtn).toBeDisabled();
  });

  it('changes regenerate button text to "생성 중..." when isLoading is true', () => {
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByRole('button', { name: /생성 중/ })).toBeInTheDocument();
  });
});

describe('ComponentCard - Viewport Controls', () => {
  it('renders viewport buttons when preview tab is active', () => {
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByRole('button', { name: /모바일/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /태블릿/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /데스크탑/ })).toBeInTheDocument();
  });

  it('does not render viewport buttons when code tab is active', async () => {
    const user = userEvent.setup();
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={false}
      />
    );

    await user.click(screen.getByRole('button', { name: /코드/ }));

    expect(screen.queryByRole('button', { name: /모바일/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /태블릿/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /데스크탑/ })).not.toBeInTheDocument();
  });

  it('has desktop button as active by default', () => {
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={false}
      />
    );

    const desktopBtn = screen.getByRole('button', { name: /데스크탑/ });
    expect(desktopBtn).toHaveClass('viewport-btn--active');
  });

  it('changes active button when mobile button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={false}
      />
    );

    const mobileBtn = screen.getByRole('button', { name: /모바일/ });
    const desktopBtn = screen.getByRole('button', { name: /데스크탑/ });

    await user.click(mobileBtn);

    expect(mobileBtn).toHaveClass('viewport-btn--active');
    expect(desktopBtn).not.toHaveClass('viewport-btn--active');
  });

  it('changes active button when tablet button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ComponentCard
        component={mockComponent}
        onRemove={vi.fn()}
        onRegenerate={vi.fn()}
        isLoading={false}
      />
    );

    const tabletBtn = screen.getByRole('button', { name: /태블릿/ });
    const desktopBtn = screen.getByRole('button', { name: /데스크탑/ });

    await user.click(tabletBtn);

    expect(tabletBtn).toHaveClass('viewport-btn--active');
    expect(desktopBtn).not.toHaveClass('viewport-btn--active');
  });
});
