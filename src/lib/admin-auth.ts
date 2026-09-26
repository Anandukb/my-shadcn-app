import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasPermission, hasAnyPermission, packagePermissionOptions, SUPER_ADMIN_SLUG, type Permission, type PermissionAction } from '@/lib/access/permissions';

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Signed in as staff, but the role lacks the permission. Extends
// UnauthorizedError so existing route catch blocks keep working; they read
// `status` and `message` to build the response.
export class ForbiddenError extends UnauthorizedError {
  constructor(message = "You don't have permission to do that") {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

export interface AdminContext {
  user: User;
  fullName: string | null;
  roleId: string | null;
  roleSlug: string | null;
  roleName: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
}

/** Any active staff account, regardless of role. */
export async function requireAdminSession(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin' || profile?.is_active === false) {
    throw new UnauthorizedError();
  }

  return user;
}

/** The signed-in staff member together with their role and permissions. */
export async function getAdminContext(): Promise<AdminContext> {
  const user = await requireAdminSession();

  const service = createAdminClient();
  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('full_name, role_id')
    .eq('id', user.id)
    .single();

  const roleId: string | null = profile?.role_id ?? null;
  let role: { slug: string; name: string; permissions: string[] } | null = null;
  let rolesReady = !profileError;

  if (roleId) {
    const { data, error } = await service
      .from('roles')
      .select('slug, name, permissions')
      .eq('id', roleId)
      .single();
    role = data;
    if (error && !data) rolesReady = false;
  }

  // Roles migration not applied yet (missing column/table): every active staff
  // account was a full admin before roles existed, so keep them that way
  // instead of locking everyone out.
  if (!rolesReady) {
    return {
      user,
      fullName: user.user_metadata?.full_name ?? null,
      roleId: null,
      roleSlug: SUPER_ADMIN_SLUG,
      roleName: 'Super Admin',
      isSuperAdmin: true,
      permissions: [],
    };
  }

  const isSuperAdmin = role?.slug === SUPER_ADMIN_SLUG;

  return {
    user,
    fullName: profile?.full_name ?? null,
    roleId,
    roleSlug: role?.slug ?? null,
    roleName: role?.name ?? null,
    isSuperAdmin,
    permissions: role?.permissions ?? [],
  };
}

/** Requires an active staff account whose role grants every listed permission. */
export async function requirePermission(...required: Permission[]): Promise<User> {
  const ctx = await requireAdminContext(...required);
  return ctx.user;
}

export async function requireAdminContext(...required: Permission[]): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!required.every((p) => hasPermission(ctx, p))) {
    throw new ForbiddenError();
  }
  return ctx;
}

/**
 * Package actions are allowed by the All Packages permission or by the
 * permission of the package's own category page (Holidays, Cruise, ...).
 */
export async function requirePackagePermission(
  action: PermissionAction,
  categories: string[],
): Promise<AdminContext> {
  const ctx = await getAdminContext();
  const allowed = categories.every((category) => hasAnyPermission(ctx, packagePermissionOptions(action, category)));
  if (!allowed) throw new ForbiddenError();
  return ctx;
}
