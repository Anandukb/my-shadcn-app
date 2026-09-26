import { describe, it, expect } from 'vitest';
import { resolveHostRedirect } from './admin-host';

const base = { adminHost: 'admin.example.com', defaultLocale: 'en' };

describe('resolveHostRedirect', () => {
  it('does nothing when ADMIN_HOST is not configured', () => {
    expect(resolveHostRedirect({ ...base, adminHost: undefined, requestHost: 'example.com', pathname: '/en/admin' })).toBeNull();
  });

  it('sends admin URLs on the public host to the admin host', () => {
    expect(resolveHostRedirect({ ...base, requestHost: 'example.com', pathname: '/ar/admin/blog' })).toEqual({
      host: 'admin.example.com',
      pathname: '/ar/admin/blog',
    });
    expect(resolveHostRedirect({ ...base, requestHost: 'www.example.com', pathname: '/en/admin/login' })?.host).toBe('admin.example.com');
  });

  it('leaves public pages on the public host alone', () => {
    expect(resolveHostRedirect({ ...base, requestHost: 'example.com', pathname: '/en/blog' })).toBeNull();
    expect(resolveHostRedirect({ ...base, requestHost: 'example.com', pathname: '/en/administration' })).toBeNull();
  });

  it('keeps admin pages on the admin host', () => {
    expect(resolveHostRedirect({ ...base, requestHost: 'admin.example.com', pathname: '/en/admin/packages' })).toBeNull();
    expect(resolveHostRedirect({ ...base, requestHost: 'ADMIN.example.com:443', pathname: '/en/admin' })).toBeNull();
  });

  it('sends everything else on the admin host into the admin, keeping the locale', () => {
    expect(resolveHostRedirect({ ...base, requestHost: 'admin.example.com', pathname: '/' })).toEqual({ host: null, pathname: '/en/admin' });
    expect(resolveHostRedirect({ ...base, requestHost: 'admin.example.com', pathname: '/ar/holiday-packages' })).toEqual({ host: null, pathname: '/ar/admin' });
  });
});
