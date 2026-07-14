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
