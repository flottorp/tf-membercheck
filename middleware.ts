// @ts-ignore - This file only runs on Vercel Edge runtime
import type { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (metadata files)
     * - public assets (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

export default async function middleware(request: NextRequest) {
  // @ts-ignore - NextResponse is available on Vercel Edge
  const { NextResponse } = await import('next/server');
  
  // Get password from environment variable
  const PASSWORD = process.env.SITE_PASSWORD;

  // Check for authorization header
  const authHeader = request.headers.get('authorization');

  // If authorization header exists and matches
  if (authHeader) {
    const authValue = authHeader.split(' ')[1];
    const [username, password] = atob(authValue).split(':');

    if (password === PASSWORD) {
      return NextResponse.next();
    }
  }

  // Check for cookie-based authentication (for better UX)
  const authCookie = request.cookies.get('tf-auth');
  if (authCookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  // Return 401 with Basic Auth challenge
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Topptur og Frikjøring - Medlemsportal"',
    },
  });
}
