# React 컴포넌트 생성기

프롬프트를 입력하면 AI가 React 컴포넌트를 즉시 생성하고, 실시간 미리보기와 코드를 제공합니다.

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Bun (Claude API 프록시 서버)
- **미리보기**: react-live (런타임 렌더링)

## 실행 방법

```bash
# 의존성 설치
bun install

# API 서버 (터미널 1)
bun run server

# 프론트엔드 (터미널 2)
bun run dev
```

브라우저에서 `http://localhost:5173` 접속 후 Anthropic API 키를 입력하면 사용할 수 있습니다.
