// src/hooks/useCommunityPermissions.ts
"use client";

import { useSession } from "next-auth/react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export function useCommunityPermissions() {
  const { data: session, status } = useSession();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  
  const isAuthenticated = status === "authenticated";
  const loading = status === "loading" || subscriptionLoading;
  
  // Check if the current user can create threads
  const canCreateThreads = isAuthenticated && hasActiveSubscription;
  
  // Check if the current user can reply to threads/messages
  const canReply = isAuthenticated && hasActiveSubscription;
  
  // Check if the current user can upvote (available to all authenticated users)
  const canUpvote = isAuthenticated;
  
  // Check if the current user can report (available to all authenticated users)
  const canReport = isAuthenticated;
  
  // Check if the current user is the author of content
  const isAuthor = (userId?: number) => {
    if (!isAuthenticated || !session?.user?.id) return false;
    return Number(session.user.id) === userId;
  };
  
  // Check if the current user can delete content
  const canDelete = (userId?: number) => {
    return isAuthor(userId);
  };
  
  // Check if the current user can edit content
  const canEdit = (userId?: number) => {
    return isAuthor(userId);
  };
  
  // Check if the current user is an admin
  const isAdmin = isAuthenticated && session?.user?.role === "admin";
  
  return {
    isAuthenticated,
    loading,
    canCreateThreads,
    canReply,
    canUpvote,
    canReport,
    isAuthor,
    canDelete,
    canEdit,
    isAdmin,
    userId: session?.user?.id ? Number(session.user.id) : undefined
  };
}