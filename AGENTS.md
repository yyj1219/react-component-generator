@AGENTS.md

# AGENTS.md

## Operational Commands

All commands use Bun only (no npm, yarn, or pnpm).

```bash
# Start development server + frontend (required for testing)
bun run dev

# Backend server only (watch mode, server/src/index.ts)
bun run server

# Build for production
bun run build

# Type-check
bun run lint

# Install dependencies
bun install
```

## Golden Rules

**Immutable Constraints:**

- **Bun-Only:** This project uses Bun exclusively. Never suggest npm, yarn, or pnpm. If dependencies are needed, add to `bunfig.toml` or `package.json` and run `bun install`.
- **API Proxy:** All AI API calls must go through `/api/generate` (server/index.ts). Never expose API keys to client code or make direct Anthropic/Google calls from frontend.
- **Component Code Generation:** Generated React code follows strict rules defined in `src/components/AGENTS.md`. Violations break react-live rendering.
- **Environment Variables:** Sensitive keys (ANTHROPIC_API_KEY, GOOGLE_API_KEY) must use environment variables only. Server prioritizes client-provided keys over ENV.

**Do's:**

- Always run `bun run dev` before testing UI changes.
- Test both Anthropic and Google provider flows if changing the proxy server.
- Use inline styles exclusively in generated components (no CSS modules, no style imports).
- Verify generated code renders in react-live before completing a feature.

**Don'ts:**

- Never hardcode API keys in any file or comment.
- Do not add dependencies without checking Bun compatibility.
- Do not bypass the `/api/generate` endpoint for AI calls.
- Do not modify the SYSTEM_PROMPT without understanding react-live constraints.

## Project Context

A web application that generates React components from natural language prompts using Anthropic Claude or Google Gemini, with real-time preview via react-live.

**Tech Stack:** React 19, TypeScript, Vite, Bun, react-live, Anthropic SDK, Google Generative AI.

**Core Capability:** Transform text prompt → React component code → render preview.

## Standards & References

**Commit Message Format:**

Use conventional commits:
```
<type>(<scope>): <description>

<body (optional)>
```

Example: `feat(api): add rate limiting for /api/generate`

**Maintenance Policy:**

If rules and code diverge, propose updates to this file immediately. Keep AGENTS.md in sync with actual constraints and best practices.

## Context Map

- **[Component Generation Rules](./src/components/AGENTS.md)** — React code generation, react-live constraints, inline styling.
- **[Backend API Server](./server/AGENTS.md)** — Anthropic/Google proxy, environment setup, error handling.
