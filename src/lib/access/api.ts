import 'server-only';

import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';
import { requireAdminContext, UnauthorizedError, type AdminContext } from '@/lib/admin-auth';
import type { Permission } from './permissions';
import { AccessError } from './access-service';

type Handler = (ctx: AdminContext) => Promise<NextResponse>;

/** Auth + permission check and uniform error mapping for the user/role routes. */
export async function withAccess(permissions: Permission[], handler: Handler): Promise<NextResponse> {
  try {
    const ctx = await requireAdminContext(...permissions);
    return await handler(ctx);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof AccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AccessError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }
  return parsed.data;
}
