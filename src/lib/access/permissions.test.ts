import { describe, it, expect } from 'vitest';
import { ALL_PERMISSIONS, hasPermission, isValidPermission, permissionsForPath, PATH_PERMISSIONS } from './permissions';

describe('permissions', () => {
  it('lists each permission once and validates known keys', () => {
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
    expect(isValidPermission('packages:edit')).toBe(true);
    expect(isValidPermission('packages:fly')).toBe(false);
    expect(isValidPermission('live_chat:delete')).toBe(false);
  });

  it('gives a Super Admin every permission and others only what was granted', () => {
    expect(hasPermission({ isSuperAdmin: true, permissions: [] }, 'users:delete')).toBe(true);
    expect(hasPermission({ isSuperAdmin: false, permissions: ['blog:view'] }, 'blog:view')).toBe(true);
    expect(hasPermission({ isSuperAdmin: false, permissions: ['blog:view'] }, 'blog:edit')).toBe(false);
  });

  it('maps admin pages to a permission that exists', () => {
    for (const { anyOf } of PATH_PERMISSIONS) for (const p of anyOf) expect(isValidPermission(p)).toBe(true);
    expect(permissionsForPath('/admin/blog')).toEqual(['blog:view']);
    expect(permissionsForPath('/admin/holidays')).toEqual(['holidays:view', 'packages:view']);
    expect(permissionsForPath('/admin')).toBeNull();
  });
});

describe('package permissions', () => {
  it('accepts All Packages or the matching category page', async () => {
    const { packagePermissionOptions } = await import('./permissions');
    expect(packagePermissionOptions('edit', 'cruise')).toEqual(['packages:edit', 'cruise:edit']);
    expect(packagePermissionOptions('view', 'fixed-departure')).toEqual(['packages:view', 'fixed_departures:view']);
    expect(packagePermissionOptions('delete', 'unknown')).toEqual(['packages:delete']);
  });
});
