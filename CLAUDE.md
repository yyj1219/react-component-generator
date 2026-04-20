@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

React 컴포넌트 생성기는 AI(Claude/Gemini)를 활용하여 텍스트 프롬프트로부터 React 컴포넌트를 생성하는 웹 애플리케이션입니다. 생성된 컴포넌트는 실시간으로 렌더링되어 미리보기를 제공합니다.

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend API Proxy**: Bun (TypeScript runtime)
- **Component Runtime**: react-live (sandboxed execution environment)
- **AI Providers**: Anthropic Claude / Google Gemini (selectable)
- **Build/Package Manager**: Bun

## Project Structure

```
src/
  components/
    PromptInput.tsx        # Prompt 입력 및 생성 버튼
    ComponentCard.tsx      # 생성된 컴포넌트를 담는 카드 UI
    LivePreview.tsx        # react-live를 사용한 실시간 렌더링
    CodeView.tsx           # 생성된 코드 표시
  hooks/
    useComponentGenerator.ts  # API 호출 및 컴포넌트 상태 관리
  types/
    index.ts               # TypeScript 타입 정의 (Provider, GeneratedComponent)
  App.tsx                  # 메인 앱 컴포넌트 (레이아웃, 상태 조정)
  main.tsx                 # React DOM 마운트 포인트

server/
  index.ts                 # Bun API 서버
    - POST /api/generate   # AI API 프록시 (Anthropic/Google)
    - GET /api/config      # 환경 변수 설정 상태 조회
```

## Commands

```bash
# 프로젝트 초기화
bun install

# 개발 서버 + 프론트엔드 동시 실행 (권장)
bun run dev

# 서버만 실행 (watch mode)
bun run server

# 타입스크립트 컴파일 + Vite 빌드
bun run build

# ESLint 실행
bun run lint

# 빌드 결과 미리보기
bun run preview
```

## Environment Setup

```bash
# .env 파일 생성 (선택사항)
cp .env.example .env

# .env에 API 키 설정:
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

- .env에 키를 설정하면 UI에서 선택 없이 자동으로 사용됨
- .env 없어도 UI에서 직접 API 키 입력 가능 (클라이언트 키가 서버 키 덮어씀)

## Architecture Notes

### Frontend Flow

1. **App.tsx**: 전체 상태 관리 (선택된 Provider, API 키, 생성된 컴포넌트 목록)
2. **PromptInput**: 사용자 입력 수집 → `useComponentGenerator.generate()` 호출
3. **useComponentGenerator**: 
   - `/api/generate` 엔드포인트 호출
   - 응답받은 코드를 `GeneratedComponent` 객체로 변환
   - 상태 업데이트 (components, isLoading, error)
4. **ComponentCard**: 각 생성된 컴포넌트 렌더링
   - **LivePreview**: react-live의 `LiveProvider`에서 코드 샌드박싱 후 렌더링
   - **CodeView**: 코드 블록 표시
   - 재생성/삭제 버튼

### Backend Proxy (server/index.ts)

- **목적**: 클라이언트에서 직접 API 호출하지 않도록 API 프록시 역할
- **POST /api/generate**:
  - 요청: `{ prompt, provider, apiKey? }`
  - 클라이언트 apiKey가 있으면 우선 사용, 없으면 ENV 키 사용
  - Anthropic/Google API 호출
  - 응답: `{ code }` (생성된 JSX 코드)
- **GET /api/config**:
  - 응답: `{ envKeys: { anthropic: boolean, google: boolean } }`
  - UI에 "설정됨" 배지 표시용

### Component Code Generation Rules

SYSTEM_PROMPT (server/index.ts)에 정의된 규칙:
- Inline styles만 사용 (CSS import/modules 금지)
- Import 문 사용 금지 (React는 전역으로 제공됨)
- react-live 렌더링 위해 마지막에 `render(<ComponentName />)` 호출 필수
- Plain JavaScript만 사용 (TypeScript 구문 금지)
- 반응형 및 인터랙티브 요소 권장

## Design System

최근 업데이트로 레트로 빈티지 테마 적용:
- **색상 팔레트**: 1970년대 따뜻한 톤 (#e74c3c, #2c1810, #f5e6d3 등)
- **타이포그래피**: Righteous, Courier Prime, Nunito
- **UI 요소**: 굵은 테두리, 오프셋 섀도우, 미세한 회전 효과
- **배경**: 따뜻한 톤의 그라디언트 + 텍스처 패턴

## Common Development Tasks

- **컴포넌트 추가**: `src/components/` 내 새로운 .tsx 파일 생성
- **훅 추가**: `src/hooks/` 내 새로운 .ts 파일 생성
- **API 엔드포인트 추가**: `server/index.ts`에서 라우트 추가
- **스타일 수정**: `src/App.css` 또는 `src/index.css` 편집
- **프로바이더 추가**: `server/index.ts`에 새로운 AI API 통합 + `Provider` 타입 확장

## Testing the App

```bash
bun run dev
# 브라우저: http://localhost:5173
# 1. Provider 선택 (Anthropic/Google)
# 2. API 키 입력 또는 .env에서 자동 로드
# 3. 프롬프트 입력 및 생성 버튼 클릭
# 4. LivePreview에서 컴포넌트 렌더링 확인
# 5. CodeView에서 생성된 코드 확인
```
