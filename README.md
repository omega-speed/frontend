# Next.js App Template

An opinionated Next.js starter with shadcn/ui, a dark sharp-cornered design system, cookie-based JWT auth, and strong conventions for forms, services, and folder structure.

## Stack

- **Next.js** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (`components.json` configured, components live in `components/ui/`)
- **react-hook-form + Zod** for forms and validation
- **Framer Motion** for entrance animations, **sonner** for toasts
- Cookie-based JWT auth (access + refresh) with automatic refresh in `proxy.ts` and `lib/api.ts`

## Getting started

```bash
pnpm install
cp .env.example .env   # point BASE_URL at your backend
pnpm dev
```

Then rename the app: edit `lib/config.ts` (`APP_NAME`, `APP_DESCRIPTION`, `COMPANY_NAME`) and replace `app/icon.svg`.

## Structure & conventions

```
app/
  (auth)/          sign-in, sign-up, email-verification, forgot/reset password
  (dashboard)/     authenticated app — sidebar + header chrome in layout.tsx
    home/          starter page (page.tsx + loading.tsx skeleton)
    storage/       presigned-URL file upload helpers (client-side image compression)
  (legal)/         terms / privacy / cookie policy placeholders
components/
  ui/              shadcn components (sharp corners, design tokens)
  molecules/       reusable app components — Controlled* form fields, OTP input,
                   pagination, file dropzone, page wrapper, profile menu
  motion/          StaggerReveal entrance animation
lib/
  config.ts        app name/branding — single place to rebrand
  api.ts           HTTP client — attaches Bearer token, retries once on 401
  auth.ts          cookie token helpers (get/set/clear, decode, refresh)
  schemas.ts       apiResponse / paginatedApiResponse Zod envelope helpers
proxy.ts           route protection + token refresh
```

Every feature follows the same shape — `app/(section)/[feature]/` with:

- `page.tsx` — server component (never `"use client"`), plus `loading.tsx` skeleton
- `service.ts` — `"use server"` actions calling `api.*`, wrapped in try/catch
- `types.ts` — Zod schemas + inferred types
- `_components/` and `_hooks/` — co-located client components and form/mutation hooks

Forms always use the `Controlled*` molecules with a `use-[feature]` hook (react-hook-form + zodResolver) — never raw `register()`.

The full ruleset lives in `DESIGN.md` and the Claude Code skills in `.claude/skills/`, wired in via `CLAUDE.md` / `AGENTS.md`:

- `design-rules` — the enforced conventions (server components, no `useEffect`, skeletons, service/hook rules)
- `forms-and-services` — usage guide: the `Controlled*` form component reference, form/mutation hook templates, `lib/api` + `service.ts`/`types.ts` patterns, full worked example
- `code-review` — review checklist for all of the above

## Backend contract

The API client expects a backend that:

- Accepts `Authorization: Bearer <access_token>` and returns the envelope `{ success, status_code, message, data, meta? }`
- Exposes `auth/signin`, `auth/signup`, `auth/refresh`, `auth/logout`, email-OTP verification endpoints, `users/me`, and `storage/presign` (adjust the services under `app/(auth)/*/service.ts` to match yours)

Set `BASE_URL` in `.env` to the backend origin.

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

`components.json` is already configured (style, aliases, Tailwind v4 CSS variables). Remember: no rounded corners — strip any `rounded-*` classes from generated components.
