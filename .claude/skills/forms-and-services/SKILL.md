---
name: forms-and-services
description: Usage guide for building forms (Controlled* components + _hooks/use-* form hooks) and calling the backend (lib/api client, service.ts, types.ts) — includes the Controlled component reference and a full worked example
user-invocable: true
---

# Forms & Services — Usage Guide

How every feature talks to the backend and renders forms. The *rules* are enforced
by the `design-rules` skill; this is the how-to reference.

## Feature anatomy

Every feature lives at `app/(section)/[feature]/` with this shape:

```
app/(dashboard)/posts/
  page.tsx          server component — fetches via service, never "use client"
  loading.tsx       route-level skeleton
  types.ts          Zod schemas + inferred types
  service.ts        "use server" actions calling api.*
  _components/      client components (forms, cards, modals)
  _hooks/           use-[feature].ts form/mutation hooks
```

Data flows: `page.tsx` → `service.ts` → `lib/api.ts` → backend, and forms flow:
`_components/form.tsx` → `_hooks/use-x.ts` → `service.ts`.

## The API layer

### `lib/api.ts` — the HTTP client

**Never call `fetch` directly.** Import the `api` object:

```ts
import api from "@/lib/api";

api.get(endpoint)              // GET    (optional 2nd arg: RequestInit overrides)
api.post(endpoint, payload)    // POST   JSON body
api.put(endpoint, payload)     // PUT
api.patch(endpoint, payload)   // PATCH
api.delete(endpoint, payload?) // DELETE (optional body)
api.formData(endpoint, fd)     // POST multipart FormData (no Content-Type header)
```

What it does for you:
- Reads the access token from httpOnly cookies and attaches `Authorization: Bearer`
- On a 401, refreshes the token once (`auth/refresh`) and retries the request
- On non-2xx, resolves (does **not** throw) with `{ ...errorBody, status }` — so
  check `response.success` / `response.status`, don't try/catch for API errors
- Endpoints are **relative paths without a leading slash** (`"users/me"`, not `"/users/me"`);
  the base URL comes from `process.env.BASE_URL`

The backend envelope is `{ success, status_code, message, data, meta? }`.

### `service.ts` — server actions

Every backend call goes through a co-located `service.ts`:

```ts
"use server";

import api from "@/lib/api";
import type { CreatePostPayload } from "./types";

// reads: camelCase
export async function getPosts(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const endpoint = query.toString() ? `posts?${query}` : "posts";
  try {
    return await api.get(endpoint);
  } catch (error) {
    return error;
  }
}

// mutations: PascalCase
export async function CreatePost(payload: CreatePostPayload) {
  try {
    return await api.post("posts", payload);
  } catch (error) {
    return error;
  }
}
```

Rules:
- `"use server"` at the top, always
- Wrap in try/catch and **return** the error (callers branch on `response.success`)
- Reads `camelCase` (`getPosts`), mutations `PascalCase` (`CreatePost`, `SignIn`)
- Pagination/filters via `URLSearchParams`
- Auth: after a successful login/refresh response call `setAuthTokens()` from
  `@/lib/auth`; for logout use the existing `logOut()` in `app/(dashboard)/service.ts`

### `types.ts` — Zod schemas

All API types are Zod schemas (never plain `interface`), using the envelope
helpers from `@/lib/schemas`:

```ts
import { z } from "zod";
import { apiResponse, paginatedApiResponse } from "@/lib/schemas";

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
});

export const postResponseSchema = apiResponse(postSchema);            // single resource
export const postsResponseSchema = paginatedApiResponse(postSchema);  // list + meta

export const createPostPayload = z.object({
  title: z.string().min(1, "Title is required"),
});

export type Post = z.infer<typeof postSchema>;
export type CreatePostPayload = z.infer<typeof createPostPayload>;
```

Derive schemas from the backend's actual response (check its API docs / OpenAPI
spec first — never guess the shape).

## The form layer

**Never use raw `register()`.** Every form = a `use-[feature]` hook in `_hooks/`
plus `Controlled*` components inside `<Form {...form}>`.

### Form hook — `_hooks/use-create-post.ts`

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPostPayload, type CreatePostPayload } from "../types";
import { CreatePost } from "../service";

export function useCreatePost() {
  const { push } = useRouter();
  const form = useForm<CreatePostPayload>({
    resolver: zodResolver(createPostPayload),
    defaultValues: { title: "" },
  });
  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = handleSubmit(async (data) => {
    const response = await CreatePost(data);
    if (!response?.success) {
      toast.error(response?.message ?? "Something went wrong");
      return;
    }
    toast.success(response.message);
    push("/posts");
  });

  return { form, onSubmit, isSubmitting };
}
```

### Wiring the form component — `_components/create-post-form.tsx`

```tsx
"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import { useCreatePost } from "../_hooks/use-create-post";

export function CreatePostForm() {
  const { form, onSubmit, isSubmitting } = useCreatePost();

  return (
    <Form {...form}>
      <ControlledInput name="title" label="Title" placeholder="My post" />
      <Button loading={isSubmitting} onClick={() => onSubmit()}>
        Create
      </Button>
    </Form>
  );
}
```

Notes:
- `<Form {...form}>` provides the RHF context — `Controlled*` components find their
  field by `name` alone
- `<Button loading={isSubmitting}>` handles the spinner + disable; never hand-roll one

### Controlled component reference — `components/molecules/`

All take `name` (RHF field name) and render label/error/description themselves.

| Component | Import | Key props beyond `name`/`label` |
|---|---|---|
| `ControlledInput` | `controlled-input` | `type`, `placeholder`, `showEyeIcon` (password toggle), `icon` (left icon), `rightLink` ({label, href} in label row), `rightAddon` (element inside input), `optional`, `disabled`, `readOnly`, `min`, `onChange`, `inputClassName`, `labelClassName` |
| `ControlledTextarea` | `controlled-textarea` | `placeholder`, `optional`, `disabled`, `readOnly` |
| `ControlledSelect` | `controlled-select` | `values: {name, value}[]`, `placeholder`, `onChange`; list pagination: `hasMore`, `paramName`, `onShowMore` (Show More appends to a URL search param) |
| `ControlledCombobox` | `controlled-combobox` | searchable select: `options: {value, label, icon?}[]`, `searchPlaceholder`, `emptyText`, `renderOption`, `onChange` |
| `ControlledCheckboxGroup` | `controlled-checkbox` | `options: {label, value}[]` — field value is a `string[]` |
| `ControlledDateTimePicker` | `controlled-date-picker` | `showTime` (default true), `disablePast`, `onChange` — field value is a `Date` |
| `ControlledPhoneInput` | `controlled-phone-input` | country-code picker + national number; field value is E.164 (`+2348012345678`); `inputClassName`, `labelClassName` |

Not RHF-bound (controlled via props, wire with `FormField` yourself if needed):

| Component | Usage |
|---|---|
| `OtpInput` (`otp-input`) | 6-digit code entry: `value`, `onChange`, `disabled` — see the auth verification forms |
| `FileDropzone` (`file-dropzone`) | `onFileChange(file)`, `label`, `accept`, `previewUrl`, `helperText` — pair with `UploadFile` from `app/(dashboard)/storage/service.ts` (presigned-URL upload with client-side image compression) |

### Mutation hooks (non-form actions)

Toggles/deletes use `useTransition` + optimistic state — no `useEffect`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ToggleLike } from "../service";

export function useToggleLike(id: string, initial: boolean) {
  const [liked, setLiked] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const prev = liked;
    setLiked(!liked); // optimistic
    startTransition(async () => {
      const response = await ToggleLike(id);
      if (!response?.success) {
        setLiked(prev); // revert
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return { liked, toggle, isPending };
}
```

## Checklist for a new feature

1. Confirm endpoint method/path/shapes against the backend API docs
2. `types.ts` — Zod payload + response schemas (`apiResponse`/`paginatedApiResponse`)
3. `service.ts` — `"use server"`, try/catch, correct naming
4. `_hooks/use-[feature].ts` — form hook (or `useTransition` mutation hook)
5. `_components/` — `<Form {...form}>` + `Controlled*` + `<Button loading>`
6. `page.tsx` stays a server component; add `loading.tsx` skeleton
