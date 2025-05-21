// src/lib/auth/session-helper.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * Helper to get the authenticated user ID from a session
 * Falls back to email lookup if ID is not directly available
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<{
  userId?: number;
  error?: NextResponse;
}> {
  // Get session
  const session = await getServerSession();
  
  // Debug logging
  console.log("Session in getAuthenticatedUserId:", {
    hasSession: !!session,
    hasUserId: !!session?.user?.id,
    hasEmail: !!session?.user?.email
  });
  
  // Check if session exists at all
  if (!session?.user) {
    console.log("Authentication failed: No session found");
    return {
      error: NextResponse.json(
        { error: "You must be signed in to perform this action" },
        { status: 401 }
      )
    };
  }
  
  // Try to get ID directly from session
  if (session.user.id) {
    const userId = parseInt(session.user.id);
    if (!isNaN(userId)) {
      return { userId };
    }
  }
  
  // Fall back to email lookup if ID is not available
  if (session.user.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (!user) {
        console.log("Authentication failed: User not found for email:", session.user.email);
        return {
          error: NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          )
        };
      }
      
      return { userId: user.id };
    } catch (error) {
      console.error("Error looking up user by email:", error);
      return {
        error: NextResponse.json(
          { error: "Error authenticating user" },
          { status: 500 }
        )
      };
    }
  }
  
  // If we get here, we couldn't resolve a user ID
  console.log("Authentication failed: Couldn't determine user ID");
  return {
    error: NextResponse.json(
      { error: "Unable to identify user" },
      { status: 401 }
    )
  };
}