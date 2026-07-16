import 'server-only';

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
