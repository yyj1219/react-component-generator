import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
  viewportSize?: 'mobile' | 'tablet' | 'desktop';
}

export function LivePreview({ code, viewportSize = 'desktop' }: LivePreviewProps) {
  const widthMap = { mobile: '375px', tablet: '768px', desktop: '100%' };

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div
            className="preview-viewport-inner"
            style={{ maxWidth: widthMap[viewportSize], width: '100%', margin: '0 auto' }}
          >
            <div className="preview-render">
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
