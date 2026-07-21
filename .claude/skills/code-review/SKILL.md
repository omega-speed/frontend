---
name: code-review
description: Review frontend code for quality, correctness, and design rule violations
user-invocable: true
---

## Design Rules

### Rule #1 — No Rounded Borders. Ever.
- **Never** use `rounded`, `rounded-*`, `border-radius`, or any CSS that curves corners
- Applies everywhere: buttons, cards, inputs, modals, images, avatars, tags — no exceptions
- Flag any `rounded` Tailwind class or `border-radius` in CSS/style props as a violation

## Zod Typing Convention

All types must be defined with Zod schemas, not plain TypeScript `interface` or `type`. Place them in `types.ts` co-located with the feature.

```ts
import { z } from "zod";

export const itemSchema = z.object({ ... });
export type Item = z.infer<typeof itemSchema>;
```

When the shape wraps the standard API envelope (`success`, `status_code`, `message`, `data`), use the `apiResponse` helper from `@/lib/schemas` instead of repeating the envelope fields:

```ts
import { z } from "zod";
import { apiResponse } from "@/lib/schemas";

export const itemSchema = z.object({ ... });
export const itemsResponseSchema = apiResponse(z.array(itemSchema));

export type Item = z.infer<typeof itemSchema>;
export type ItemsResponse = z.infer<typeof itemsResponseSchema>;
```

- Schema variable: `camelCase` ending in `Schema`
- Type export: `PascalCase` matching the resource name
- `apiResponse` accepts any `ZodTypeAny`, so pass a single schema, an array, or a union

## Review Checklist

When reviewing code, check for:

1. **Design violations** — any rounded borders (see Rule #1)
2. **Server components** — `page.tsx` and `layout.tsx` must never have `"use client"` (see Rule #2)
3. **Loading skeletons** — every data-fetching page/section must have a skeleton (see Rule #3)
4. **No `useEffect`** — flag any usage; confirm it's truly in the 1% exception category (see Rule #4)
5. **No icons** — use text labels instead; flag any lucide/icon imports unless the use is universally unambiguous or explicitly requested
6. **Backend calls** — only through `api` from `@/lib/api`, never raw `fetch`; service files must have `"use server"` and try/catch
6. **TypeScript** — all props explicitly typed, no `any`
6. **Zod schemas** — API response types use Zod, not plain `interface` or `type`
7. **No inline styles** — use Tailwind classes only, no `style={{}}` props
8. **No hardcoded colors** — use design tokens, not hex values
9. **Component structure** — functional components only, no class components
10. **Naming** — PascalCase components, camelCase utils, UPPER_SNAKE_CASE constants

## Output Format

For each issue found, report:
- **File + line** — where the violation is
- **Rule** — which rule it breaks
- **Fix** — what to change it to
