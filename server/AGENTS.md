@AGENTS.md

# Backend API Server

## Module Context

This directory implements the API proxy server (Bun) that forwards requests to Anthropic Claude and Google Generative AI. It enforces API key management, rate limiting, and response formatting for the frontend.

## Tech Stack & Constraints

**Backend-Only Stack:**

- Runtime: Bun (no Node.js alternatives).
- HTTP Framework: Bun's built-in `Bun.serve()`.
- AI SDKs: `@anthropic-ai/sdk` and `@google/generative-ai`.
- Never: Do not use Express, Fastify, or other Node frameworks.

**Environment Variables:**

- `ANTHROPIC_API_KEY` — Anthropic service key (optional, can be client-provided).
- `GOOGLE_API_KEY` — Google service key (optional, can be client-provided).
- `PORT` — Server port (default 3001).

**Key Priority Order:**

1. Client-provided API key (request body takes precedence).
2. Environment variable key (fallback if client key absent).
3. Error: If both missing, reject with 400.

## Implementation Patterns

**Route Handler Pattern:**

```typescript
// POST /api/generate
const body = await request.json();
const { prompt, provider, apiKey } = body;

// Validate
if (!prompt || !provider) return new Response('Missing fields', { status: 400 });

// Prioritize client key over ENV
const key = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
if (!key) return new Response('No API key', { status: 400 });

// Call AI service and return { code }
```

**Error Handling:**

- Network errors: 503 Service Unavailable.
- Auth errors (invalid key): 401 Unauthorized.
- Rate limiting: 429 Too Many Requests.
- Malformed requests: 400 Bad Request.
- Always return JSON error format: `{ error: 'message' }`.

**SYSTEM_PROMPT Constraints:**

The SYSTEM_PROMPT in `index.ts` dictates generated code format. It ensures:
- Inline styles only.
- No imports.
- `render(<Component />)` at the end.
- Plain JavaScript (no TypeScript).

Changes require testing both providers and verification in react-live.

## Testing Strategy

**Unit Testing (if added):**

```bash
# Test API routes (mock Anthropic/Google responses)
bun test server/index.test.ts
```

**Integration Testing (manual):**

```bash
bun run dev
# 1. Call POST /api/generate with valid prompt + provider
# 2. Verify response contains `{ code: '...' }`
# 3. Test with both providers (Anthropic and Google)
# 4. Test missing API key scenario (should 401)
# 5. Test invalid provider name (should 400)
```

**Provider-Specific Tests:**

- **Anthropic:** Verify `client.messages.create()` response parsing.
- **Google:** Verify `model.generateContent()` response parsing.
- Both: Test timeout behavior (set timeout, trigger delay, verify graceful error).

## Local Golden Rules

**Do's:**

- Always use environment variable keys for production deployments.
- Return consistent JSON structure: `{ code }` for success, `{ error }` for failure.
- Log API calls (prompt, provider, timestamp) for debugging (but never log keys).
- Implement request validation before calling AI services.
- Test response parsing; AI output format may vary.

**Don'ts:**

- Do not expose full API keys in error messages.
- Do not concatenate user input directly into prompts (sanitize).
- Do not bypass the SYSTEM_PROMPT (AI must follow component code rules).
- Do not add new dependencies without Bun compatibility checks.
- Do not store request history in memory (unbounded growth).
