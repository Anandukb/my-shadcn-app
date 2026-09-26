// Splits the site across two hostnames served by the same deployment:
//   public host -> the marketing site (admin URLs redirect to the admin host)
//   admin host  -> only the admin panel (everything else redirects into it)
// Inactive unless ADMIN_HOST is set, so local development keeps working as-is.

const ADMIN_PATH = /^\/(en|ar)\/admin(\/|$)/;
const LOCALE_PATH = /^\/(en|ar)(\/|$)/;

export interface HostRedirect {
  /** Host (with port, if any) to send the visitor to; null keeps the current host. */
  host: string | null;
  pathname: string;
}

const hostname = (host: string) => host.toLowerCase().replace(/:\d+$/, '');

export function resolveHostRedirect(opts: {
  requestHost: string | null;
  pathname: string;
  adminHost: string | undefined;
  defaultLocale: string;
}): HostRedirect | null {
  const { requestHost, pathname, adminHost, defaultLocale } = opts;
  if (!adminHost || !requestHost) return null;

  const onAdminHost = hostname(requestHost) === hostname(adminHost);
  const isAdminPath = ADMIN_PATH.test(pathname);

  if (onAdminHost) {
    if (isAdminPath) return null;
    const locale = pathname.match(LOCALE_PATH)?.[1] ?? defaultLocale;
    return { host: null, pathname: `/${locale}/admin` };
  }

  if (isAdminPath) return { host: adminHost, pathname };
  return null;
}
