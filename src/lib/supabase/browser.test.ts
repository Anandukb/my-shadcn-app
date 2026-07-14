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
