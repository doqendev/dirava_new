# AGENTS.md
Guide for autonomous coding agents in `E:\doqendev\dirava_new`.

## 1) Project Snapshot
- Product: Mizoke (anime merch e-commerce + gacha)
- Framework: Next.js 14 App Router + React 18
- Language: TypeScript strict
- Package manager: `pnpm@8.15.0`
- Runtime: Node `>=18.17.0`
- Styling: Tailwind CSS 3 (custom neon tokens)
- State: Zustand stores
- Data: Shopify Storefront/Admin GraphQL
- i18n: `next-intl`

## 2) Source-of-Truth Files
- `package.json`: scripts/commands
- `tsconfig.json`: strict TS behavior
- `vitest.config.ts`: unit/component test setup
- `playwright.config.ts`: E2E setup
- `next.config.js`: plugin chain and build config
- `tailwind.config.ts`, `src/app/globals.css`: design tokens

## 3) Build / Lint / Test Commands
Run from repo root.

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
```

### Single test execution (important)
Vitest:
```bash
# single file
pnpm test src/lib/utils/__tests__/validation.test.ts

# by test name
pnpm test -t "rate limit"

# explicit runner form
pnpm exec vitest run src/lib/utils/__tests__/validation.test.ts
```

Playwright:
```bash
# single spec
pnpm test:e2e e2e/cart.spec.ts

# by test title
pnpm test:e2e -g "add product to cart"
```

Typical local validation:
```bash
pnpm type-check && pnpm lint && pnpm test
```

## 4) Cursor / Copilot Rules Status
- `.cursor/rules/` not found
- `.cursorrules` not found
- `.github/copilot-instructions.md` not found
- If added later, those files become additional high-priority agent guidance.

## 5) Architecture Map
- Routes/layout/pages: `src/app/**`
- API route handlers: `src/app/api/**`
- Reusable components: `src/components/**`
- Stores (Zustand): `src/stores/**`
- Shopify integration: `src/lib/shopify/**`
- Shared utilities: `src/lib/utils/**`
- i18n config/messages: `src/i18n/**`
- Domain data/types: `src/data/**`, `src/types/**`

## 6) Code Style Guidelines (Repository-Observed)

### Imports
- Prefer this order:
  1. React/Next imports
  2. third-party packages
  3. internal imports via `@/`
  4. type-only imports (`import type ...`)
- Prefer alias paths (`@/*`) over deep relative paths.

### Formatting
- Match existing style:
  - single quotes
  - no semicolons
  - trailing commas where valid
  - 2-space indentation
- Break long object literals/types across lines for readability.

### TypeScript rules
- Keep strict typing intact (`strict`, `noUncheckedIndexedAccess`, etc.).
- Never introduce `any`, `@ts-ignore`, or `@ts-expect-error`.
- Use `unknown` for untrusted payloads, then validate/refine.
- Prefer explicit interfaces/types for props, store state, API responses.
- Use generic typing for GraphQL/API request responses.

### Naming conventions
- Components, interfaces, types: PascalCase
- Variables/functions/hooks: camelCase
- Hooks must start with `use`
- Module-level constants/maps: UPPER_SNAKE_CASE when used as fixed config
- File naming:
  - components: `PascalCase.tsx`
  - hooks/stores/utils: `camelCase.ts`
  - tests: `*.test.ts[x]` or `*.spec.ts`

### React / Next.js patterns
- Use server components by default in `src/app/**`.
- Add `'use client'` only for client-only behavior (hooks, browser APIs, local state).
- Follow existing split pattern where present: server `page.tsx` + client `*Content.tsx`.
- Use Next metadata APIs (`generateMetadata`, `viewport`) as in current layout/page files.

### Tailwind/UI patterns
- Compose classes with `cn()` from `src/lib/utils/cn.ts`.
- Reuse existing design tokens (`neon-*`, `bg-*`, `shadow-glow-*`).
- Reuse existing component variants/size maps before adding new styles.

### Zustand patterns
- Define state and actions in typed interfaces.
- Keep actions explicit and side-effect aware.
- For persisted stores, persist only necessary slices (`partialize`).
- Avoid direct mutation; return new objects/sets where needed.

### Shopify/API patterns
- Reuse existing clients/wrappers in `src/lib/shopify`.
- Keep GraphQL query/mutation variables and response types explicit.
- Validate required env vars at module boundaries.
- Validate/sanitize external input in API routes and utilities.

### Error handling
- No empty `catch` blocks.
- Use contextual logs (e.g. `console.error('Failed to X:', error)`).
- Return user-safe errors (no leaked secrets/tokens).
- Follow existing patterns like `{ success: boolean; error?: string }` when applicable.

### Testing conventions
- Prefer tests close to code (`__tests__` or same-folder pattern).
- Use Vitest + Testing Library for unit/component tests.
- Use Playwright for user-flow/regression E2E.
- Test behavior/output, not implementation details.

## 7) Agent Working Rules
- Make minimal, surgical diffs.
- Do not rewrite unrelated files.
- Avoid new dependencies unless necessary and justified.
- Do not commit unless the user explicitly asks.
- Run relevant verification commands before claiming completion.

## 8) Pre-Completion Checklist
```bash
pnpm type-check
pnpm lint
pnpm test
# run `pnpm test:e2e` when UI/flow behavior changed significantly
```
- No new TypeScript or lint errors in touched scope
- Relevant tests pass
- Changes match repository conventions
