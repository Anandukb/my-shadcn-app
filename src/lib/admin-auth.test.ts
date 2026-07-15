import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const singleMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: singleMock,
        }),
      }),
    }),
  }),
}));

import { requireAdminSession, UnauthorizedError } from './admin-auth';

describe('requireAdminSession', () => {
  beforeEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
  });

  it('throws UnauthorizedError when there is no user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    await expect(requireAdminSession()).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError when Supabase returns an auth error', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: new Error('boom') });

    await expect(requireAdminSession()).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError when the profile has no admin role', async () => {
    const fakeUser = { id: 'user-1', email: 'staff@maram.com' };
    getUserMock.mockResolvedValue({ data: { user: fakeUser }, error: null });
    singleMock.mockResolvedValue({ data: { role: 'viewer' }, error: null });

    await expect(requireAdminSession()).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError when the profile lookup errors', async () => {
    const fakeUser = { id: 'user-1', email: 'admin@maram.com' };
    getUserMock.mockResolvedValue({ data: { user: fakeUser }, error: null });
    singleMock.mockResolvedValue({ data: null, error: new Error('not found') });

    await expect(requireAdminSession()).rejects.toThrow(UnauthorizedError);
  });

  it('returns the user when the profile role is admin', async () => {
    const fakeUser = { id: 'user-1', email: 'admin@maram.com' };
    getUserMock.mockResolvedValue({ data: { user: fakeUser }, error: null });
    singleMock.mockResolvedValue({ data: { role: 'admin' }, error: null });

    const user = await requireAdminSession();
    expect(user).toEqual(fakeUser);
  });
});
