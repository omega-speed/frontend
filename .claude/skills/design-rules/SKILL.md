---
name: design-rules
description: Enforce component patterns, Tailwind conventions, and naming standards
user-invocable: true
---

## Rule #1 — No Rounded Borders. Ever.
- **Never** use `rounded`, `rounded-*`, `border-radius`, or any CSS that curves corners
- This applies everywhere: buttons, cards, inputs, modals, images, avatars, tags — no exceptions
- If you see `rounded` in any Tailwind class, remove it
- If you see `border-radius` in any CSS/style prop, remove it

## Rule #2 — Pages and Layouts Are Always Server Components
- `page.tsx` and `layout.tsx` files must never have `"use client"`
- Keep data fetching, redirects, and auth checks in server components
- Push interactivity down into leaf client components

## Rule #3 — Always Provide a Loading Skeleton
- Every page or section that fetches data must have a corresponding loading state
- Use `loading.tsx` next to `page.tsx` for route-level skeletons (Next.js Suspense boundary)
- For component-level async sections, wrap with `<Suspense fallback={<YourSkeleton />}>`
- Build skeletons with `<Skeleton>` from `@/components/ui/skeleton` — match the shape of the real UI
- Never leave a blank/empty screen while data loads

## Rule #4 — Never Use `useEffect`
- `useEffect` is banned in 99% of cases. Do not reach for it by default
- **Fetch data** → use server components or server actions, not `useEffect` + `useState`
- **Derived state** → compute it inline during render, not in an effect
- **Subscriptions / external stores** → use `useSyncExternalStore`
- **DOM measurements / third-party lib setup** → the rare 1% where it is acceptable
- If you are about to write `useEffect`, stop and ask: can this be a server component, a server action, or derived state?

## Backend Communication Patterns

> Full usage guide — including the Controlled* form component reference and a
> complete worked example — lives in the `forms-and-services` skill. The sections
> below are the enforced rules.

### Implementing a new endpoint — always follow this order
1. Fetch the backend's API docs (e.g. the Swagger UI at `${BASE_URL}/docs` — set the real URL for your backend here) and find the endpoint to confirm the HTTP method, path, request body, and response shape
2. Create `types.ts` with Zod schemas derived from the actual response (use `paginatedApiResponse` for list endpoints, `apiResponse` for single-resource endpoints, plain `z.object` for non-API-envelope shapes)
3. Create or update `service.ts` with `"use server"` and the correct `api.*` call

Never guess the method or shape — always verify against the docs first.

If the backend exposes an OpenAPI JSON spec (e.g. `${BASE_URL}/docs-json`), use Bash + curl to fetch and resolve schemas — WebFetch cannot reach localhost:
```bash
curl -s http://localhost:PORT/docs-json | python3 -c "
import sys, json
spec = json.load(sys.stdin)
schemas = spec.get('components', {}).get('schemas', {})
def resolve(obj, schemas):
    if isinstance(obj, dict):
        if '\$ref' in obj: return resolve(schemas.get(obj['\$ref'].split('/')[-1], {}), schemas)
        return {k: resolve(v, schemas) for k, v in obj.items()}
    if isinstance(obj, list): return [resolve(i, schemas) for i in obj]
    return obj
# Print a specific path:
path = spec['paths'].get('/your/endpoint', {})
print(json.dumps(resolve(path, schemas), indent=2))
"
```

### The HTTP client — `lib/api.ts`
- **Never use `fetch` directly.** All backend calls go through the `api` object from `@/lib/api`
- Available methods: `api.get(endpoint)`, `api.post(endpoint, payload)`, `api.put(endpoint, payload)`, `api.patch(endpoint, payload)`, `api.delete(endpoint, payload?)`, `api.formData(endpoint, formData)`
- The client automatically attaches the `Authorization: Bearer` token from cookies and retries once on 401 with a refreshed token — do not handle this manually

### Service files
- Every feature gets a `service.ts` co-located at `app/(section)/[feature]/service.ts`
- Always has `"use server"` at the top — these are server actions, never called from client components
- Every function wraps the call in `try/catch` and returns the error on failure:
  ```ts
  "use server";
  import api from "@/lib/api";

  export async function getThings(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const endpoint = query.toString() ? `things?${query}` : "things";
    try {
      return await api.get(endpoint);
    } catch (error) {
      return error;
    }
  }

  export async function CreateThing(payload: CreateThingPayload) {
    try {
      return await api.post("things", payload);
    } catch (error) {
      return error;
    }
  }
  ```
- Naming: reads use `camelCase` (`getGames`), mutations use `PascalCase` (`SignIn`, `CreateThing`)
- Query params for pagination/filtering: build with `URLSearchParams` and append to the endpoint string

### Auth helpers — `lib/auth.ts`
- Tokens live in httpOnly cookies — never in `localStorage` or JS-accessible state
- `getCurrentUser()` — decodes the JWT from cookies; use this in server components to get the logged-in user
- `setAuthTokens({ access_token, refresh_token })` — call after a successful login response
- `logout()` — clears both cookies and redirects to `/sign-in`
- Never access cookies directly; always go through these helpers

## Rule #5 — Avoid Icons
- Do not use icons by default. Prefer text labels, abbreviations, or typographic treatments
- Icons are acceptable when they reinforce a concept visually (e.g. a coin icon next to a coin count) or the meaning is universally unambiguous
- Never use an icon as the sole label for something that isn't immediately obvious

## Hook Patterns

### Form hooks — `_hooks/use-[feature].tsx`
Use react-hook-form + zodResolver. Co-locate inside the feature's `_hooks/` folder.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SomePayload, somePayloadSchema } from "../types";
import { SomeAction } from "../service";

export function useSomeFeature() {
  const { push } = useRouter();
  const form = useForm<SomePayload>({
    resolver: zodResolver(somePayloadSchema),
    defaultValues: { ... },
  });
  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = handleSubmit(async (data) => {
    const response = await SomeAction(data);
    if (!response.success) {
      toast.info(response.message);
      return;
    }
    toast.success(response.message);
    push("/somewhere");
  });

  return { form, onSubmit, isSubmitting };
}
```

### Mutation hooks (non-form) — `_hooks/use-[action].tsx`
For non-form interactions (toggles, deletes, etc.) use `useTransition` with optimistic state. No `useEffect`.

```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SomeAction } from "../service";

export function useSomeAction(id: number, initialState: boolean) {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const trigger = () => {
    const prev = state;
    setState(!state); // optimistic update

    startTransition(async () => {
      const response = await SomeAction(id);
      if (!response?.success) {
        setState(prev); // revert on failure
        toast.error(response?.message || "Something went wrong");
      }
    });
  };

  return { state, trigger, isPending };
}
```

### Date/time formatting
Always use `dayjs` with the `relativeTime` plugin — never write custom time helpers.

```ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

dayjs(dateStr).fromNow(); // "3 hours ago"
```

## Component Patterns

### Buttons — always use `<Button>` from `@/components/ui/button`
- **Never** render a plain `<button>` for an actionable button. Use the shared `<Button>` component so sizing, variants, focus states, and the loading spinner stay consistent app-wide.
- **Loading states use the `loading` prop** — it automatically disables the button *and* renders the spinner. **Never** hand-roll a spinner (e.g. `{busy && <Loader2 className="animate-spin" />}`) inside a button.
  ```tsx
  // ✅ do this
  <Button loading={busy} onClick={onSave}>Save</Button>

  // ❌ never this
  <button disabled={busy} onClick={onSave}>
    {busy && <Loader2 className="animate-spin" />} Save
  </button>
  ```
- Pick a `variant` (`default` | `outline` | `secondary` | `ghost` | `destructive` | `link`) and `size` (`default` | `sm` | `xs` | `lg` | `icon…`) for styling. Only add `className` for layout (`w-full`, `flex-1`) or a semantic color no variant covers (e.g. `win`/gold — use the `default` variant + the color classes in `className`, not `outline`, which drags in a border and muted hover).
- If `disabled` also has non-loading conditions, keep those in `disabled` and let `loading` own the busy state: `<Button loading={busy} disabled={!isValid}>`.
- The **only** acceptable standalone spinner is a **non-button** status indicator — a search "Searching…" row, a section "loading…" placeholder, etc. Button spinners are never hand-rolled.
