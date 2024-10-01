// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(req) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const url = req.nextUrl.clone();

//   // Redirect authenticated users from the root to /recording
//   if (req.nextUrl.pathname === '/' && token) {
//     url.pathname = '/recording';
//     return NextResponse.redirect(url);
//   }

//   // Allow access if not redirecting
//   return NextResponse.next();
// }

// // Define which paths this middleware applies to
// export const config = {
//   matcher: ['/', '/recording'],
// };

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();

  if (token) {
    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (token.exp && token.exp < currentTime) {
      // Token is expired, redirect to "/" and clear session
      url.pathname = '/api/auth/signout'; // Redirect to sign out endpoint
      url.searchParams.set('callbackUrl', '/'); // After sign out, redirect to root
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users from the root to /recording
    if (req.nextUrl.pathname === '/') {
      url.pathname = '/recording';
      return NextResponse.redirect(url);
    }
  }

  // Allow access if not redirecting
  return NextResponse.next();
}

// Define which paths this middleware applies to
export const config = {
  matcher: ['/', '/recording'],
};
