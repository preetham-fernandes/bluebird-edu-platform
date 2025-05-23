// src/middleware.ts
// This middleware should be added to your project to ensure proper session handling

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and auth callbacks
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname.includes('/api/auth/callback/') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Check if the user is authenticated
  const isAuthenticated = !!token;
  
  // Define public routes that don't need authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/error",
    "/api/auth"
  ];
  
  // Check if the current route is public
  const _isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes("/favicon.ico")
  );
  
  // Protected routes: API routes for community actions
  const isCommunityApiRoute = pathname.startsWith("/api/community/") && 
    (pathname.includes("/threads") || pathname.includes("/messages"));
  
  // If it's a community API route and the user is not authenticated, return 401
  if (isCommunityApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: "You must be signed in to perform this action" },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match dashboard and user routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/community/:path*",
    // Match protected API routes
    "/api/community/:path*",
    // Match auth routes
    "/login",
    "/register",
    // Don't match other API routes or assets
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};