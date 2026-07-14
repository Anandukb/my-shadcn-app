import type { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export async function updateSession(request: NextRequest, response: NextResponse): Promise<User | null> {
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
