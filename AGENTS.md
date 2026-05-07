# Code Review Rules

## Skill Index

When reviewing, check which file types are in the diff and load only the relevant skills:

| File pattern | Skill to load |
|---|---|
| `*.ts`, `*.tsx` | TypeScript rules → see below |
| `*.tsx`, `*.jsx`, `*.ts` with React | React 19 rules → see below |
| `className=`, `cn(`, `*.css` | Tailwind rules → see below |
| Zod schemas, `z.object`, `z.string` | Zod rules → see below |
| Zustand stores, `create(` | Zustand rules → see below |
| `useChat`, `streamText`, AI SDK imports | AI SDK rules → see below |
| `*.py` | Python/pytest rules → see below |
| Django, DRF, `ViewSet`, `Serializer` | Django DRF rules → see below |
| `*.spec.*`, `*.test.*`, Playwright | Testing rules → see below |
| Next.js, `app/`, `page.tsx`, `layout.tsx` | Next.js rules → see below |

---

## General Rules (always active — ALL files)

REJECT if:
- Hardcoded secrets, API keys, or credentials in code
- `console.log` / `print()` / `debugger` left in production code
- Empty catch/except blocks (silent error swallowing)
- Code duplication — clear DRY violation
- Commented-out blocks of code left in

REQUIRE:
- Descriptive variable and function names (no `x`, `tmp`, `data2`)
- Error messages that help debugging

---

## TypeScript

REJECT if:
- `any` type used without `// @ts-expect-error` justification
- Inline nested objects in interfaces (use separate interface instead)
- Missing return types on exported functions
- Direct union types when runtime access is needed — use `as const` object instead

PREFER:
- `import type` for type-only imports
- Discriminated unions for state modeling
- Utility types (`Pick`, `Omit`, `Partial`) over manual repetition

---

## React 19

REJECT if:
- `import React from "react"` or `import * as React` — use named imports
- `forwardRef` — in React 19, ref is just a prop
- `useMemo` / `useCallback` present **only if React Compiler is configured** — otherwise keep them

REQUIRE:
- `"use client"` directive in components that use state, effects, or event handlers
- Named imports: `import { useState, useEffect } from "react"`

---

## Next.js 15

REJECT if:
- Client-side data fetching in Server Components — fetch in the component directly
- Missing `"use client"` in components with hooks or event handlers
- `getServerSideProps` or `getStaticProps` — use App Router patterns

PREFER:
- `Promise.all` for parallel data fetching
- `Suspense` for streaming slow components
- `server-only` package for server-exclusive modules

---

## Tailwind CSS

REJECT if:
- `var(--token)` inside `className` — use semantic Tailwind class instead
- Hex colors in `className` (e.g. `text-[#fff]`) — use Tailwind color classes
- `cn()` wrapping purely static classes — use `className` directly

REQUIRE:
- `cn()` for conditional or merged classes
- `style` prop only for truly dynamic values (percentages, runtime values)

---

## Zod

REJECT if (Zod v4 project):
- `z.string().email()` — use `z.email()` (top-level in v4)
- `z.string().uuid()` — use `z.uuid()`
- `message:` in error options — use `error:` in v4

REJECT if (Zod v3 project):
- `z.email()` top-level — does not exist in v3, use `z.string().email()`

REQUIRE:
- `safeParse` over `parse` at boundaries (avoids unhandled throws)
- `z.infer<typeof schema>` for derived types

---

## Zustand

REJECT if:
- Entire store selected (`const store = useStore()`) — causes re-render on every change
- Multiple fields selected without `useShallow`

REQUIRE:
- Selector per field or `useShallow` for multiple fields
- Typed interfaces for store shape

---

## Vercel AI SDK

REJECT if (v5 project):
- `import { useChat } from "ai"` — use `@ai-sdk/react`
- `message.content` as string — use `message.parts` array

REJECT if (v4 project):
- `import { useChat } from "@ai-sdk/react"` — use `"ai"` package
- `DefaultChatTransport` — does not exist in v4

---

## Python / pytest

REJECT if:
- Missing type hints on public functions
- Bare `except:` without specific exception type
- `print()` instead of `logger`

REQUIRE:
- Fixtures in `conftest.py` for shared setup
- `pytest.mark.parametrize` for data-driven tests

---

## Django REST Framework

REJECT if:
- Logic in views instead of services/serializers
- Missing `permission_classes` on ViewSets
- N+1 queries — use `select_related` / `prefetch_related`

REQUIRE:
- Separate serializers for read, create, and update operations
- `StandardPagination` on list endpoints

---

## Testing (Playwright)

REJECT if:
- CSS class or ID selectors (`.btn-primary`, `#email`) — use `getByRole` / `getByLabel`
- Tests without `{ tag: [...] }` metadata
- Page logic duplicated across tests instead of Page Object

REQUIRE:
- Page Object Model — one class per page
- `BasePage` extended by all page objects
- `getByRole` as first selector choice

---

## Response Format

FIRST LINE must be exactly one of:
STATUS: PASSED
STATUS: FAILED

If FAILED, list violations as:
`file:line - rule - issue description`
