# Supabase Foundation + Admin Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Supabase connection layer (env-validated client factories for browser/server/admin contexts) and replace the fake client-side admin auth (hardcoded credentials + `localStorage.admin_auth`) with real Supabase Auth, enforced server-side in middleware.

**Architecture:** All Supabase access goes through typed client factories under `src/lib/supabase/`. Admin route protection happens in `src/middleware.ts` (server-side, before any admin page renders) rather than in a client component checking `localStorage`. A `profiles` table (1:1 with Supabase's `auth.users`) gives every admin account a role/display-name row via an auto-create trigger, ready for later plans to reference as `created_by`/`updated_by`.

**Tech Stack:** `@supabase/supabase-js`, `@supabase/ssr`, Vitest (new — no test runner exists in this repo yet), Supabase CLI (dev dependency, for the local migration).

This is **Plan 1 of 3** for the Supabase backend design (`docs/superpowers/specs/2026-07-14-supabase-backend-design.md`). Plan 2 (packages catalog + admin CRUD) and Plan 3 (enquiry capture) both depend on the auth foundation built here.

## Global Constraints

- The Supabase **service-role key** must never be exposed to client bundles or committed to version control — it is read only in `src/lib/supabase/admin.ts`, server-side.
- Row Level Security is enabled on every table, but it is **defense-in-depth only** — the primary authorization boundary is TypeScript code (`src/lib/admin-auth.ts`, middleware), not Postgres policies, so the app can move off Supabase later without losing its authorization logic.
- No test runner exists in this repo today (confirmed: no Jest/Vitest/Playwright config, no `test` script). This plan adds a minimal Vitest setup as its first task.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## Prerequisites (manual, one-time, before Task 1)

These require a real Supabase account and cannot be scripted by an agent:

1. Create a project at https://supabase.com/dashboard (or use an existing one).
2. From **Project Settings → API**, note down:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` `public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` `secret` key (`SUPABASE_SERVICE_ROLE_KEY`)
3. Add these three to `.env.local` (already present in the repo, currently empty):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Create at least one admin user to test with, from **Authentication → Users → Add user** in the dashboard (email + password). This is the account used to verify Task 7/8 manually.

Tasks 1–4 below are pure TypeScript and are fully testable via mocked env vars — they do not require the real project to be reachable. Task 5 (SQL migration) and Task 7/8 (login flow, guard removal) do require the real project from the steps above.

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `vitest.config.ts` | Create | Test runner config with `@/` path alias resolution. |
| `src/lib/__tests__/sanity.test.ts` | Create | Proves the test runner works. |
| `src/lib/supabase/env.ts` | Create | Reads/validates the three Supabase env vars, throws descriptive errors. |
| `src/lib/supabase/env.test.ts` | Create | Tests for the above. |
| `src/lib/supabase/browser.ts` | Create | Supabase client for client components (used by the login page). |
| `src/lib/supabase/browser.test.ts` | Create | Tests for the above. |
| `src/lib/supabase/server.ts` | Create | Supabase client for Server Components/Route Handlers, cookie-aware (user session). |
| `src/lib/supabase/server.test.ts` | Create | Tests for the above. |
| `src/lib/supabase/admin.ts` | Create | Service-role Supabase client, used by the repository layer in Plans 2/3. |
| `src/lib/supabase/admin.test.ts` | Create | Tests for the above. |
| `src/lib/supabase/middleware.ts` | Create | `updateSession()` helper: refreshes the auth cookie, returns the current user or `null`. |
| `src/lib/supabase/middleware.test.ts` | Create | Tests for the above. |
| `src/lib/admin-auth.ts` | Create | `requireAdminSession()` + `UnauthorizedError`, used by Route Handlers in Plans 2/3. |
| `src/lib/admin-auth.test.ts` | Create | Tests for the above. |
| `supabase/migrations/<timestamp>_create_profiles.sql` | Create | `profiles` table, RLS policies, auto-create trigger. |
| `src/middleware.ts` | Modify | Combine next-intl locale routing with Supabase session refresh + server-side admin-route redirect. |
| `src/app/[locale]/(admin)/admin/login/page.tsx` | Modify | Real `supabase.auth.signInWithPassword` instead of hardcoded credential check. |
| `src/components/admin/AdminGuard.tsx` | Delete | No longer needed — middleware enforces the guard server-side. |
| `src/app/[locale]/(admin)/admin/(dashboard)/page.tsx`, `cruise/page.tsx`, `fixed-departures/page.tsx`, `holidays/page.tsx`, `kerala/page.tsx`, `medical/page.tsx`, `packages/page.tsx` | Modify | Remove the now-redundant `<AdminGuard>` wrapper. |

---

### Task 1: Add Vitest test runner

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/sanity.test.ts`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Produces: `npm test` command, usable by every later task in this plan (and Plans 2/3).

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create the Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write a sanity test**

```ts
// src/lib/__tests__/sanity.test.ts
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/__tests__/sanity.test.ts
git commit -m "test: add Vitest test runner"
```

---

### Task 2: Supabase env validation + client factories

**Files:**
- Create: `src/lib/supabase/env.ts`
- Create: `src/lib/supabase/env.test.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/browser.test.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/server.test.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/supabase/admin.test.ts`

**Interfaces:**
- Produces: `getSupabaseEnv(options?: { requireServiceRole?: boolean }): { url: string; anonKey: string; serviceRoleKey?: string }` (throws `Error` on missing vars).
- Produces: `createClient(): SupabaseClient` from `browser.ts`.
- Produces: `async createClient(): Promise<SupabaseClient>` from `server.ts`.
- Produces: `createAdminClient(): SupabaseClient` from `admin.ts`.
- Consumed by: Task 3 (`middleware.ts` uses the same env pattern), Task 4 (`admin-auth.ts` imports `server.ts`'s `createClient`), Task 7 (login page imports `browser.ts`'s `createClient`), and Plans 2/3 (repository layer imports `admin.ts`'s `createAdminClient`).

- [ ] **Step 1: Install the Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Write the failing env tests**

```ts
// src/lib/supabase/env.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSupabaseEnv } from './env';

const ORIGINAL_ENV = { ...process.env };

describe('getSupabaseEnv', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    expect(() => getSupabaseEnv()).toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
    );
  });

  it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getSupabaseEnv()).toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  });

  it('returns url and anonKey when both are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    expect(getSupabaseEnv()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    });
  });

  it('throws when service role is required but missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => getSupabaseEnv({ requireServiceRole: true })).toThrow(
      'Missing environment variable: SUPABASE_SERVICE_ROLE_KEY'
    );
  });

  it('returns serviceRoleKey when required and present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    expect(getSupabaseEnv({ requireServiceRole: true })).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
      serviceRoleKey: 'service-role-key',
    });
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- src/lib/supabase/env.test.ts`
Expected: FAIL — `Cannot find module './env'`.

- [ ] **Step 4: Implement `env.ts`**

```ts
// src/lib/supabase/env.ts
interface SupabaseEnvOptions {
  requireServiceRole?: boolean;
}

interface SupabaseEnv {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export function getSupabaseEnv(options: SupabaseEnvOptions = {}): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!anonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (options.requireServiceRole) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
    }
    return { url, anonKey, serviceRoleKey };
  }

  return { url, anonKey };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/lib/supabase/env.test.ts`
Expected: 5 tests PASS.

- [ ] **Step 6: Write the failing browser client test**

```ts
// src/lib/supabase/browser.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from './browser';

const ORIGINAL_ENV = { ...process.env };

describe('createClient (browser)', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns a Supabase client when env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const client = createClient();
    expect(typeof client.from).toBe('function');
  });

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    expect(() => createClient()).toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
    );
  });
});
```

- [ ] **Step 7: Run it to verify it fails, then implement `browser.ts`**

Run: `npm test -- src/lib/supabase/browser.test.ts` → expect FAIL (`Cannot find module './browser'`).

```ts
// src/lib/supabase/browser.ts
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
```

Run: `npm test -- src/lib/supabase/browser.test.ts` → expect 2 tests PASS.

- [ ] **Step 8: Write the failing server client test**

```ts
// src/lib/supabase/server.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => {},
  }),
}));

import { createClient } from './server';

const ORIGINAL_ENV = { ...process.env };

describe('createClient (server)', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns a Supabase client when env vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const client = await createClient();
    expect(typeof client.from).toBe('function');
  });
});
```

- [ ] **Step 9: Run it to verify it fails, then implement `server.ts`**

Run: `npm test -- src/lib/supabase/server.test.ts` → expect FAIL (`Cannot find module './server'`).

```ts
// src/lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render; middleware refreshes the session instead.
        }
      },
    },
  });
}
```

Run: `npm test -- src/lib/supabase/server.test.ts` → expect 1 test PASS.

- [ ] **Step 10: Write the failing admin client test**

```ts
// src/lib/supabase/admin.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from './admin';

const ORIGINAL_ENV = { ...process.env };

describe('createAdminClient', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow(
      'Missing environment variable: SUPABASE_SERVICE_ROLE_KEY'
    );
  });

  it('returns a Supabase client when all env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const client = createAdminClient();
    expect(typeof client.from).toBe('function');
  });
});
```

- [ ] **Step 11: Run it to verify it fails, then implement `admin.ts`**

Run: `npm test -- src/lib/supabase/admin.test.ts` → expect FAIL (`Cannot find module './admin'`).

```ts
// src/lib/supabase/admin.ts
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseEnv({ requireServiceRole: true });

  return createSupabaseJsClient(url, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

Run: `npm test -- src/lib/supabase/admin.test.ts` → expect 2 tests PASS.

- [ ] **Step 12: Run the full test suite**

Run: `npm test`
Expected: all tests across every file so far PASS.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json src/lib/supabase/
git commit -m "feat: add Supabase env validation and client factories"
```

---

### Task 3: Middleware session helper (`updateSession`)

**Files:**
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/supabase/middleware.test.ts`

**Interfaces:**
- Consumes: `getSupabaseEnv` from Task 2.
- Produces: `async updateSession(request: NextRequest, response: NextResponse): Promise<User | null>` — consumed by Task 6 (`src/middleware.ts`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/supabase/middleware.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const getUserMock = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: getUserMock },
  }),
}));

import { updateSession } from './middleware';

const ORIGINAL_ENV = { ...process.env };

describe('updateSession', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    getUserMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns null when there is no authenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('https://app.example.com/en/admin');
    const response = NextResponse.next();

    const user = await updateSession(request, response);
    expect(user).toBeNull();
  });

  it('returns the user when a session exists', async () => {
    const fakeUser = { id: 'user-1', email: 'admin@maram.com' };
    getUserMock.mockResolvedValue({ data: { user: fakeUser } });

    const request = new NextRequest('https://app.example.com/en/admin');
    const response = NextResponse.next();

    const user = await updateSession(request, response);
    expect(user).toEqual(fakeUser);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/lib/supabase/middleware.test.ts`
Expected: FAIL — `Cannot find module './middleware'`.

- [ ] **Step 3: Implement `middleware.ts`**

```ts
// src/lib/supabase/middleware.ts
import type { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export async function updateSession(request: NextRequest, response: NextResponse) {
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/lib/supabase/middleware.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/middleware.ts src/lib/supabase/middleware.test.ts
git commit -m "feat: add Supabase session-refresh middleware helper"
```

---

### Task 4: `requireAdminSession` (server-side auth check for Route Handlers)

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `src/lib/admin-auth.test.ts`

**Interfaces:**
- Consumes: `createClient` from `src/lib/supabase/server.ts` (Task 2).
- Produces: `class UnauthorizedError extends Error`, `async requireAdminSession(): Promise<User>` (throws `UnauthorizedError`) — consumed by every admin-only Route Handler in Plans 2 and 3.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/admin-auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

import { requireAdminSession, UnauthorizedError } from './admin-auth';

describe('requireAdminSession', () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it('throws UnauthorizedError when there is no user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    await expect(requireAdminSession()).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError when Supabase returns an error', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: new Error('boom') });

    await expect(requireAdminSession()).rejects.toThrow(UnauthorizedError);
  });

  it('returns the user when a session is valid', async () => {
    const fakeUser = { id: 'user-1', email: 'admin@maram.com' };
    getUserMock.mockResolvedValue({ data: { user: fakeUser }, error: null });

    const user = await requireAdminSession();
    expect(user).toEqual(fakeUser);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/lib/admin-auth.test.ts`
Expected: FAIL — `Cannot find module './admin-auth'`.

- [ ] **Step 3: Implement `admin-auth.ts`**

```ts
// src/lib/admin-auth.ts
import { createClient } from '@/lib/supabase/server';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return user;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test -- src/lib/admin-auth.test.ts`
Expected: 3 tests PASS.

- [ ] **Step 5: Run the full suite and commit**

Run: `npm test` → expect all tests across the repo PASS.

```bash
git add src/lib/admin-auth.ts src/lib/admin-auth.test.ts
git commit -m "feat: add requireAdminSession for Route Handler auth checks"
```

---

### Task 5: `profiles` table SQL migration

**Files:**
- Create: `supabase/migrations/<timestamp>_create_profiles.sql` (filename timestamp is generated by the CLI in Step 2)

**Interfaces:**
- Produces: `public.profiles` table (`id uuid PK → auth.users.id`, `full_name text`, `role text default 'admin'`, `created_at timestamptz`) — referenced by `created_by`/`updated_by` columns on `packages` in Plan 2.

- [ ] **Step 1: Install and initialize the Supabase CLI**

```bash
npm install -D supabase
npx supabase init
```

- [ ] **Step 2: Create the migration file**

```bash
npx supabase migration new create_profiles
```

This creates `supabase/migrations/<timestamp>_create_profiles.sql`. Open it and replace its contents with:

```sql
-- Profiles table: 1:1 with Supabase Auth users, holds admin role/display name.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Defense-in-depth only: primary authorization lives in TypeScript
-- (see src/lib/admin-auth.ts). Authenticated users may read/update their own row.
create policy "Profiles are viewable by the owning user"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by the owning user"
  on public.profiles for update
  using (auth.uid() = id);

-- Plumbing, not business logic: keeps profiles in sync 1:1 with auth.users so
-- every admin account created via Supabase Auth immediately has a profile row.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 3: Review checklist (in place of an automated test — this is SQL infra, not TypeScript logic)**

Confirm the file has, in order: table creation, `enable row level security`, both policies, the trigger function, and the trigger itself. All five pieces must be present.

- [ ] **Step 4: Apply the migration to the real project**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Verify in the Supabase dashboard (**Table Editor**) that `profiles` now exists with the expected columns.

- [ ] **Step 5: Manually verify the trigger**

In the dashboard, create a second test user under **Authentication → Users**, then check **Table Editor → profiles** — a matching row should now exist for that user's `id`.

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add profiles table migration with auto-create trigger"
```

---

### Task 6: Wire the admin-route guard into `src/middleware.ts`

**Files:**
- Modify: `src/middleware.ts` (full file, currently 10 lines)

**Interfaces:**
- Consumes: `updateSession` from `src/lib/supabase/middleware.ts` (Task 3).

- [ ] **Step 1: Replace the full contents of `src/middleware.ts`**

Current content:
```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from '../i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ar|en)/:path*']
};
```

Replace with:
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '../i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

const LOCALE_PATTERN = /^\/(en|ar)(\/.*)?$/;

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const user = await updateSession(request, response);

  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(LOCALE_PATTERN);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] ?? '/') : pathname;
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const isAdminRoute = pathWithoutLocale.startsWith('/admin');
  const isLoginRoute = pathWithoutLocale.startsWith('/admin/login');

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/admin/login`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*'],
};
```

- [ ] **Step 2: Manual verification (no dev server auth flow exists yet to automate this — Task 7 completes the loop)**

Run: `npm run dev`, then visit `http://localhost:3000/en/admin` in a browser with no session cookies (private/incognito window).
Expected: redirected to `http://localhost:3000/en/admin/login`.

Visit `http://localhost:3000/en/admin/login` directly.
Expected: loads the login page without redirecting (not yet functional — Task 7 wires the real sign-in).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: enforce admin route auth server-side in middleware"
```

---

### Task 7: Real Supabase Auth on the login page

**Files:**
- Modify: `src/app/[locale]/(admin)/admin/login/page.tsx`

**Interfaces:**
- Consumes: `createClient` from `src/lib/supabase/browser.ts` (Task 2).

- [ ] **Step 1: Replace the imports, state, and submit handler (lines 1–52 of the current file)**

Current (lines 1–52):
```tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, skip login page and go straight to admin dashboard
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API authorization response delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail === "admin@maram.com" && password === "maram@123") {
      localStorage.setItem("admin_auth", "true");
      setIsLoading(false);
      
      // Navigate to dashboard
      router.push("/admin");
    } else {
      setIsLoading(false);
      if (trimmedEmail !== "admin@maram.com") {
        setError("Invalid email address. Please use the correct administrator email.");
      } else {
        setError("Incorrect password. Please verify your credentials and try again.");
      }
    }
  };
```

Replace with:
```tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError("Invalid email or password. Please verify your credentials and try again.");
      return;
    }

    router.push("/admin");
    router.refresh();
  };
```

- [ ] **Step 2: Remove the "Demo Credentials Helper" box**

Find and delete this block (originally lines 178–192, immediately before the closing `</motion.div>`):
```tsx
        {/* Demo Credentials Helper Box */}
        <div className="mt-4 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            Demo Credentials Helper
          </p>
          <div className="mt-1.5 inline-flex gap-4 text-[11px] text-slate-400 bg-slate-900/30 backdrop-blur-sm border border-slate-800/40 rounded-full px-4 py-1.5 shadow-inner">
            <span>
              <strong className="text-slate-300">Email:</strong> admin@maram.com
            </span>
            <span className="text-slate-700">|</span>
            <span>
              <strong className="text-slate-300">Pass:</strong> maram@123
            </span>
          </div>
        </div>
```

The rest of the file (the JSX form markup, error display, submit button) is unchanged — it already calls `handleSubmit` and reads `email`/`password`/`error`/`isLoading` from state, which still exist under the same names.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. Visit `http://localhost:3000/en/admin/login` in an incognito window.

- Submit with wrong credentials → expect the "Invalid email or password" error message, no navigation.
- Submit with the real admin user's credentials created in the Prerequisites section → expect navigation to `/en/admin` and the dashboard to render (not redirected back to login).
- Reload `/en/admin` directly → expect it to stay on the dashboard (session cookie persists).

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/(admin)/admin/login/page.tsx"
git commit -m "feat: wire admin login to real Supabase Auth"
```

---

### Task 8: Remove the now-redundant client-side `AdminGuard`

**Files:**
- Delete: `src/components/admin/AdminGuard.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/cruise/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/fixed-departures/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/holidays/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/kerala/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/medical/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/packages/page.tsx`

Middleware (Task 6) now enforces the admin-route guard server-side before any of these pages render, so the client-side `localStorage`-based `AdminGuard` check is redundant and references a `localStorage.admin_auth` flag that no longer exists after Task 7.

- [ ] **Step 1: Find every usage**

```bash
grep -rl "AdminGuard" src/app
```

Expected output: the 7 files listed above.

- [ ] **Step 2: In each of the 7 files, remove:**
  - The import line: `import AdminGuard from "@/components/admin/AdminGuard";` (exact import path may vary slightly per file — grep confirmed it's present).
  - The opening `<AdminGuard>` tag and its matching closing `</AdminGuard>` tag, un-indenting the JSX that was between them by one level. Nothing else in each file changes — the `<DashboardShell>` (and its children) that was wrapped stays exactly as it was, just no longer nested inside `<AdminGuard>`.

- [ ] **Step 3: Delete the component file**

```bash
rm src/components/admin/AdminGuard.tsx
```

- [ ] **Step 4: Verify no references remain**

```bash
grep -rl "AdminGuard" src/
```

Expected: no output (empty).

- [ ] **Step 5: Verify the build still compiles**

```bash
npm run build
```

Expected: compiles successfully with the same route list as before (no new errors introduced).

- [ ] **Step 6: Manual verification**

Repeat Task 7 Step 3's manual checks (incognito, no session → redirected to login by middleware; valid login → dashboard renders) to confirm removing `AdminGuard` didn't reintroduce the ability to reach the dashboard without a session.

- [ ] **Step 7: Commit**

```bash
git add -A src/components/admin/AdminGuard.tsx "src/app/[locale]/(admin)/admin"
git commit -m "refactor: remove client-side AdminGuard, superseded by middleware"
```

---

## Self-Review Notes

- **Spec coverage:** Auth section (Supabase Auth, session cookies, server-side guard) → Tasks 6–8. `profiles` table from Data Model → Task 5. Repository-layer/portability principle (TypeScript owns authorization, RLS is defense-in-depth) → Tasks 4–5 and Global Constraints. Minimal Vitest for the portability boundary → Task 1 (and used throughout). Service-role key handling → Task 2's `admin.ts` + Global Constraints. Everything in this plan's scope (Supabase foundation + admin auth) is covered; packages/enquiries schema and API surface are explicitly out of scope here (Plans 2/3).
- **Placeholder scan:** no TBD/TODO markers; every step has complete, runnable code.
- **Type consistency:** `createClient` is used consistently — `browser.ts` exports a sync version, `server.ts` exports an async version (`Promise<SupabaseClient>`), and callers (`admin-auth.ts` awaits it, the login page does not since it uses the browser one) match each. `getSupabaseEnv` signature and return shape are identical across all four call sites (browser/server/admin/middleware).
