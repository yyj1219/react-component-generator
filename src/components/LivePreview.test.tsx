import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LivePreview } from './LivePreview';

const mockCode = 'render(<div>Test Component</div>)';

describe('LivePreview - Viewport Sizes', () => {
  it('renders with 375px max-width when viewportSize is mobile', () => {
    const { container } = render(
      <LivePreview code={mockCode} viewportSize="mobile" />
    );

    const viewportInner = container.querySelector('.preview-viewport-inner');
    expect(viewportInner).toHaveStyle({ maxWidth: '375px' });
  });

  it('renders with 768px max-width when viewportSize is tablet', () => {
    const { container } = render(
      <LivePreview code={mockCode} viewportSize="tablet" />
    );

    const viewportInner = container.querySelector('.preview-viewport-inner');
    expect(viewportInner).toHaveStyle({ maxWidth: '768px' });
  });

  it('renders with 100% max-width when viewportSize is desktop', () => {
    const { container } = render(
      <LivePreview code={mockCode} viewportSize="desktop" />
    );

    const viewportInner = container.querySelector('.preview-viewport-inner');
    expect(viewportInner).toHaveStyle({ maxWidth: '100%' });
  });

  it('defaults to desktop viewportSize if not provided', () => {
    const { container } = render(
      <LivePreview code={mockCode} />
    );

    const viewportInner = container.querySelector('.preview-viewport-inner');
    expect(viewportInner).toHaveStyle({ maxWidth: '100%' });
  });
});
