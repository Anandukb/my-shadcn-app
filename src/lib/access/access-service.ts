import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { AdminContext } from '@/lib/admin-auth';
import { SUPER_ADMIN_SLUG } from './permissions';
import type { Role, StaffUser } from './types';
import type { RoleInput, UserCreateInput, UserUpdateInput } from './schema';

export class AccessError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
    this.name = 'AccessError';
  }
}

interface RoleRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

const ROLE_COLUMNS = 'id, slug, name, description, permissions, is_system';

const canGrant = (ctx: AdminContext, permissions: string[]) =>
  ctx.isSuperAdmin || permissions.every((p) => ctx.permissions.includes(p));

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'role';
}

function toRole(row: RoleRow, userCount: number): Role {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
    isSystem: row.is_system,
    userCount,
  };
}

async function getRole(id: string): Promise<RoleRow> {
  const { data, error } = await createAdminClient().from('roles').select(ROLE_COLUMNS).eq('id', id).single();
  if (error || !data) throw new AccessError('Role not found', 404);
  return data as RoleRow;
}

export const accessService = {
  // ── Roles ──────────────────────────────────────────────────────────────
  async listRoles(): Promise<Role[]> {
    const db = createAdminClient();
    const [{ data: roles, error }, { data: profiles }] = await Promise.all([
      db.from('roles').select(ROLE_COLUMNS).order('created_at'),
      db.from('profiles').select('role_id'),
    ]);
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const p of profiles ?? []) {
      if (p.role_id) counts.set(p.role_id, (counts.get(p.role_id) ?? 0) + 1);
    }
    return (roles as RoleRow[]).map((r) => toRole(r, counts.get(r.id) ?? 0));
  },

  async createRole(ctx: AdminContext, input: RoleInput): Promise<Role> {
    if (!canGrant(ctx, input.permissions)) {
      throw new AccessError("You can't grant permissions you don't have yourself", 403);
    }
    const db = createAdminClient();
    const { data, error } = await db
      .from('roles')
      .insert({
        slug: `${slugify(input.name)}_${Math.random().toString(36).slice(2, 6)}`,
        name: input.name,
        description: input.description,
        permissions: input.permissions,
      })
      .select(ROLE_COLUMNS)
      .single();
    if (error) {
      throw new AccessError(error.code === '23505' ? 'A role with that name already exists' : error.message);
    }
    return toRole(data as RoleRow, 0);
  },

  async updateRole(ctx: AdminContext, id: string, input: RoleInput): Promise<Role> {
    const existing = await getRole(id);
    if (existing.is_system) throw new AccessError('System roles cannot be edited', 403);

    const added = input.permissions.filter((p) => !existing.permissions.includes(p));
    if (!canGrant(ctx, added)) {
      throw new AccessError("You can't grant permissions you don't have yourself", 403);
    }

    const { data, error } = await createAdminClient()
      .from('roles')
      .update({
        name: input.name,
        description: input.description,
        permissions: input.permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(ROLE_COLUMNS)
      .single();
    if (error) {
      throw new AccessError(error.code === '23505' ? 'A role with that name already exists' : error.message);
    }
    const { count } = await createAdminClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', id);
    return toRole(data as RoleRow, count ?? 0);
  },

  async deleteRole(id: string): Promise<void> {
    const existing = await getRole(id);
    if (existing.is_system) throw new AccessError('System roles cannot be deleted', 403);

    const db = createAdminClient();
    const { count } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', id);
    if (count) {
      throw new AccessError(`${count} user${count === 1 ? ' is' : 's are'} still assigned to this role. Reassign them first.`, 409);
    }
    const { error } = await db.from('roles').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ── Users ──────────────────────────────────────────────────────────────
  async listUsers(): Promise<StaffUser[]> {
    const db = createAdminClient();
    const [{ data: authData, error }, { data: profiles }, { data: roles }] = await Promise.all([
      db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      db.from('profiles').select('id, full_name, role, role_id, is_active'),
      db.from('roles').select('id, name, slug'),
    ]);
    if (error) throw new Error(error.message);

    const roleById = new Map((roles ?? []).map((r) => [r.id, r]));
    const users: StaffUser[] = [];
    for (const profile of profiles ?? []) {
      if (profile.role !== 'admin') continue;
      const authUser = authData.users.find((u) => u.id === profile.id);
      if (!authUser) continue;
      const role = profile.role_id ? roleById.get(profile.role_id) : undefined;
      users.push({
        id: profile.id,
        email: authUser.email ?? '',
        fullName: profile.full_name,
        roleId: profile.role_id,
        roleName: role?.name ?? null,
        roleSlug: role?.slug ?? null,
        isActive: profile.is_active,
        lastSignInAt: authUser.last_sign_in_at ?? null,
        createdAt: authUser.created_at,
      });
    }
    return users.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async createUser(ctx: AdminContext, input: UserCreateInput): Promise<StaffUser> {
    const role = await getRole(input.roleId);
    if (role.slug === SUPER_ADMIN_SLUG && !ctx.isSuperAdmin) {
      throw new AccessError('Only a Super Admin can create another Super Admin', 403);
    }
    if (!canGrant(ctx, role.permissions)) {
      throw new AccessError("You can't assign a role with permissions you don't have yourself", 403);
    }

    const db = createAdminClient();
    const { data, error } = await db.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });
    if (error || !data.user) {
      throw new AccessError(error?.message ?? 'Could not create the user', error?.status === 422 ? 409 : 400);
    }

    // The on_auth_user_created trigger already inserted the profile row.
    const { error: profileError } = await db
      .from('profiles')
      .upsert({ id: data.user.id, full_name: input.fullName, role: 'admin', role_id: input.roleId, is_active: true });
    if (profileError) {
      await db.auth.admin.deleteUser(data.user.id);
      throw new Error(profileError.message);
    }

    const created = (await this.listUsers()).find((u) => u.id === data.user!.id);
    if (!created) throw new Error('User was created but could not be loaded');
    return created;
  },

  async updateUser(ctx: AdminContext, id: string, input: UserUpdateInput): Promise<StaffUser> {
    const db = createAdminClient();
    const target = (await this.listUsers()).find((u) => u.id === id);
    if (!target) throw new AccessError('User not found', 404);

    const isSelf = id === ctx.user.id;
    const targetIsSuper = target.roleSlug === SUPER_ADMIN_SLUG;

    if (targetIsSuper && !ctx.isSuperAdmin) {
      throw new AccessError('Only a Super Admin can modify a Super Admin', 403);
    }
    if (isSelf && (input.roleId !== undefined && input.roleId !== target.roleId)) {
      throw new AccessError("You can't change your own role", 403);
    }
    if (isSelf && input.isActive === false) {
      throw new AccessError("You can't deactivate your own account", 403);
    }

    let newRole: RoleRow | null = null;
    if (input.roleId !== undefined && input.roleId !== target.roleId) {
      newRole = await getRole(input.roleId);
      if (newRole.slug === SUPER_ADMIN_SLUG && !ctx.isSuperAdmin) {
        throw new AccessError('Only a Super Admin can assign the Super Admin role', 403);
      }
      if (!canGrant(ctx, newRole.permissions)) {
        throw new AccessError("You can't assign a role with permissions you don't have yourself", 403);
      }
    }

    const losesSuper =
      targetIsSuper && target.isActive && ((newRole && newRole.slug !== SUPER_ADMIN_SLUG) || input.isActive === false);
    if (losesSuper) await this.assertAnotherSuperAdmin(id);

    const profilePatch: Record<string, unknown> = {};
    if (input.fullName !== undefined) profilePatch.full_name = input.fullName;
    if (newRole) profilePatch.role_id = newRole.id;
    if (input.isActive !== undefined) profilePatch.is_active = input.isActive;

    if (Object.keys(profilePatch).length) {
      const { error } = await db.from('profiles').update(profilePatch).eq('id', id);
      if (error) throw new Error(error.message);
    }

    const authPatch: { password?: string; ban_duration?: string; user_metadata?: Record<string, unknown> } = {};
    if (input.password !== undefined) authPatch.password = input.password;
    if (input.isActive !== undefined) authPatch.ban_duration = input.isActive ? 'none' : '876000h';
    if (input.fullName !== undefined) authPatch.user_metadata = { full_name: input.fullName };
    if (Object.keys(authPatch).length) {
      const { error } = await db.auth.admin.updateUserById(id, authPatch);
      if (error) throw new Error(error.message);
    }

    const updated = (await this.listUsers()).find((u) => u.id === id);
    if (!updated) throw new AccessError('User not found', 404);
    return updated;
  },

  async deleteUser(ctx: AdminContext, id: string): Promise<void> {
    if (id === ctx.user.id) throw new AccessError("You can't delete your own account", 403);

    const target = (await this.listUsers()).find((u) => u.id === id);
    if (!target) throw new AccessError('User not found', 404);
    if (target.roleSlug === SUPER_ADMIN_SLUG) {
      if (!ctx.isSuperAdmin) throw new AccessError('Only a Super Admin can delete a Super Admin', 403);
      if (target.isActive) await this.assertAnotherSuperAdmin(id);
    }

    const { error } = await createAdminClient().auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);
  },

  async assertAnotherSuperAdmin(excludingId: string): Promise<void> {
    const others = (await this.listUsers()).filter(
      (u) => u.id !== excludingId && u.roleSlug === SUPER_ADMIN_SLUG && u.isActive,
    );
    if (others.length === 0) {
      throw new AccessError('This is the last active Super Admin. Promote someone else first.', 409);
    }
  },
};
