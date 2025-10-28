import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['fa', 'en'];
const defaultLocale = 'fa';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // If path already starts with a locale, continue
  if (locales.some((loc) => pathname.startsWith('/' + loc))) {
    return NextResponse.next();
  }
  // Otherwise, redirect to default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
