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
