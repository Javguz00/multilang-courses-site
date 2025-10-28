import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['fa', 'en'] as const;
const defaultLocale = 'fa';
const isProd = process.env.NODE_ENV === 'production';

function setLocaleCookie(res: NextResponse, locale: string) {
  res.cookies.set('locale', locale, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If path already starts with a locale, set cookie and continue
  const matchedLocale = locales.find((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
  if (matchedLocale) {
    const res = NextResponse.next();
    setLocaleCookie(res, matchedLocale);
    return res;
  }

  // Otherwise, redirect to default locale and set cookie on the redirect response
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  const redirectRes = NextResponse.redirect(url);
  setLocaleCookie(redirectRes, defaultLocale);
  return redirectRes;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
