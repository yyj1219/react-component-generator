@AGENTS.md

# Component Generation Rules

## Module Context

This directory contains React components that render user-generated code via react-live. The sandbox environment has strict constraints: no external imports, no CSS modules, inline styles only.

## Tech Stack & Constraints

**For generated component code (what the AI creates):**

- Inline styles only: `style={{ color: 'red' }}` (required).
- No imports: React is globally available in the render context.
- No TypeScript syntax: Plain JavaScript only.
- Runtime render call: Must end with `render(<ComponentName />)` for react-live.
- No external libraries: Only React and standard DOM APIs.

**For the generation logic itself (useComponentGenerator, etc.):**

- React 19 + TypeScript in source.
- Use react-live's `<LiveProvider>` and `<LivePreview>` for sandboxed execution.
- Handle parse/render errors gracefully (catch and display to user).

## Implementation Patterns

**Generated Code Structure:**

```javascript
// Example of valid generated code
const App = () => {
  return (
    <div style={{ backgroundColor: '#e74c3c', padding: '20px' }}>
      <h1>Retro Button</h1>
      <button style={{ ... }}>Click me</button>
    </div>
  );
};

render(<App />);
```

**SYSTEM_PROMPT Maintenance:**

The system prompt in `server/index.ts` defines code generation rules. If changing:
- Always test generated code in react-live preview before deploying.
- Verify both Anthropic and Google providers respect the same constraints.
- Test edge cases: empty input, very long prompts, special characters in prop names.

**File Naming:**

- Component files: PascalCase (e.g., `ComponentCard.tsx`).
- Hook files (if added): camelCase with `use` prefix (e.g., `useComponentGenerator.ts`).

## Testing Strategy

**Manual Testing (required):**

```bash
bun run dev
# 1. Select provider (Anthropic/Google)
# 2. Enter a prompt
# 3. Verify LivePreview renders without errors
# 4. Check CodeView displays formatted code
# 5. Confirm styling and interactivity work
```

**Edge Cases to Test:**

- Very long prompts (>1000 chars).
- Prompts requesting external imports (should generate inline equivalents).
- Prompts requesting state/hooks (validate react-live support).
- Multiple component generations in sequence (memory/cleanup issues).

## Local Golden Rules

**Do's:**

- Always wrap generated code in `<LiveProvider>` with error boundary.
- Use the SYSTEM_PROMPT exactly; deviations break the AI's output format.
- Validate prompt length and content before sending to backend.
- Cache generated components to avoid redundant API calls.

**Don'ts:**

- Do not allow users to import external libraries in the prompt (not supported by react-live).
- Do not modify the generated code before rendering (only syntax highlights/formatting).
- Do not use React.lazy or code-splitting in generated components (not compatible with react-live).
- Do not store API keys in localStorage or component state.
