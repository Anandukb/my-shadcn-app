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
