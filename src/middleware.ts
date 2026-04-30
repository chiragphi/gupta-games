import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth guarding is handled client-side via useEffect in each protected page.
// Firebase client SDK does not set server-readable cookies, so server-side
// middleware cannot verify auth state.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
