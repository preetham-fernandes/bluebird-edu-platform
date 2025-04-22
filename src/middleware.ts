// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/api/auth"
  ];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes("/favicon.ico")
  );
  
  // Protected routes: dashboard and admin
  const isDashboardRoute = pathname.startsWith("/(dashboard)") || 
                          pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/obm-admin");
  
  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && (isDashboardRoute || isAdminRoute) && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (
    pathname === "/auth/login" || 
    pathname === "/auth/register"
  )) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Check if user profile is complete for authenticated users on dashboard routes
  if (isAuthenticated && isDashboardRoute && 
      pathname !== "/onboarding" && 
      !pathname.startsWith("/api/")) {
    // @ts-ignore: token has custom properties
    const profileCompleted = token.profileCompleted;
    
    if (!profileCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }
  
  // For admin routes, check if the user has admin role
  if (isAuthenticated && isAdminRoute) {
    // @ts-ignore: token has custom properties
    const isAdmin = token.role === "admin";
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match dashboard and admin routes
    "/(dashboard)/:path*",
    "/dashboard/:path*",
    "/obm-admin/:path*",
    // Match auth routes
    "/auth/:path*",
    // Match onboarding
    "/onboarding",
    // Don't match API routes except those that need protection
    "/api/((?!auth).)*",
  ],
};