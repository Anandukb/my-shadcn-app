import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const profileSingle = vi.fn();
const serviceProfileSingle = vi.fn();
const roleSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: () => ({ select: () => ({ eq: () => ({ single: profileSingle }) }) }),
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({ eq: () => ({ single: table === 'profiles' ? serviceProfileSingle : roleSingle }) }),
    }),
  }),
}));

import { requirePermission, ForbiddenError, UnauthorizedError } from './admin-auth';

describe('requirePermission', () => {
  beforeEach(() => {
    getUserMock.mockReset().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    profileSingle.mockReset().mockResolvedValue({ data: { role: 'admin', is_active: true }, error: null });
    serviceProfileSingle.mockReset().mockResolvedValue({ data: { full_name: 'A', role_id: 'r1' } });
    roleSingle.mockReset();
  });

  it('allows a role that holds the permission', async () => {
    roleSingle.mockResolvedValue({ data: { slug: 'editor', name: 'Editor', permissions: ['blog:edit'] } });
    await expect(requirePermission('blog:edit')).resolves.toMatchObject({ id: 'u1' });
  });

  it('rejects with 403 when the role lacks the permission', async () => {
    roleSingle.mockResolvedValue({ data: { slug: 'viewer', name: 'Viewer', permissions: ['blog:view'] } });
    const err = await requirePermission('blog:delete').catch((e) => e);
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.status).toBe(403);
  });

  it('lets a Super Admin through regardless of the stored list', async () => {
    roleSingle.mockResolvedValue({ data: { slug: 'super_admin', name: 'Super Admin', permissions: [] } });
    await expect(requirePermission('users:delete')).resolves.toBeDefined();
  });

  it('rejects deactivated staff before checking permissions', async () => {
    profileSingle.mockResolvedValue({ data: { role: 'admin', is_active: false }, error: null });
    await expect(requirePermission('blog:view')).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
