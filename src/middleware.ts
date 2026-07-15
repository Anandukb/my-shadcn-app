import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '../i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

const LOCALE_PATTERN = /^\/(en|ar)(\/.*)?$/;

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const user = await updateSession(request, response);

  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(LOCALE_PATTERN);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] ?? '/') : pathname;
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const isAdminRoute = pathWithoutLocale.startsWith('/admin');
  const isLoginRoute = pathWithoutLocale.startsWith('/admin/login');

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/admin/login`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*'],
};
