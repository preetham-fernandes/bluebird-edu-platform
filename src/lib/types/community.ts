// src/lib/types/community.ts

// User info returned with threads and messages
export interface CommunityUser {
    id: number;
    name: string;
    username?: string;
    avatarChoice?: string;
  }
  
  // Thread types
  export interface CommunityThread {
    id: number;
    title: string;
    content: string;
    userId: number;
    user: CommunityUser;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    replyCount: number;
    replies?: CommunityMessage[];
  }
  
  // Message types
  export interface CommunityMessage {
    id: number;
    content: string;
    userId: number;
    user: CommunityUser;
    threadId?: number;
    thread?: CommunityThread;
    parentId?: number;
    parentMessage?: CommunityMessage;
    replies?: CommunityMessage[];
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    replyCount: number;
    upvoteCount: number;
    isUpvoted?: boolean;
  }
  
  // Upvote types
  export interface MessageUpvote {
    id: number;
    messageId: number;
    userId: number;
    user?: CommunityUser;
    createdAt: string;
  }
  
  // Report types
  export interface MessageReport {
    id: number;
    messageId: number;
    message?: CommunityMessage;
    reporterId: number;
    reporter?: CommunityUser;
    reason: string;
    details?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
    resolution?: string;
    createdAt: string;
    resolvedAt?: string;
  }
  
  // Pagination response type
  export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }