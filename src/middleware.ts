import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple password gate middleware.
 * Checks for a 'fin-tracker-auth' cookie on every request.
 * If it's missing, redirect to /login.
 * The /login page and static assets are always accessible.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow access to the login page, static files, and Next.js internals
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for the auth cookie
  const authCookie = request.cookies.get('fin-tracker-auth');
  if (authCookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run middleware on all routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
