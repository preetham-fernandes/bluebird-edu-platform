// src/lib/services/community/threadService.ts
import * as threadRepository from '@/lib/db/repositories/community/threadRepository';
import * as messageRepository from '@/lib/db/repositories/community/messageRepository';
import { formatMessage } from '@/lib/utils/formatMessage';

// Get all threads with pagination
export const getThreads = async (
  page: number = 1,
  limit: number = 10
) => {
  const result = await threadRepository.getThreads(page, limit, false);
  
  // Format timestamp to human-readable form
  const formattedThreads = result.threads.map(thread => ({
    ...thread,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    replyCount: thread._count?.replies || 0
  }));
  
  return {
    threads: formattedThreads,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};

// Get a single thread with its replies
export const getThreadById = async (id: number) => {
  const thread = await threadRepository.getThreadById(id);
  
  if (!thread) {
    return null;
  }
  
  // Format timestamps and content
  const formattedThread = {
    ...thread,
    content: formatMessage(thread.content),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    replyCount: thread.replyCount,
    replies: thread.replies.map(reply => ({
      ...reply,
      content: formatMessage(reply.content),
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      replyCount: reply._count?.replies || 0,
      upvoteCount: reply._count?.upvotes || 0
    }))
  };
  
  return formattedThread;
};

// Create a new thread
export const createThread = async (
  title: string,
  content: string,
  userId: number
) => {
  // Validate input
  if (!title.trim() || !content.trim()) {
    throw new Error('Title and content are required');
  }
  
  if (title.length > 255) {
    throw new Error('Title must be less than 255 characters');
  }
  
  // Create thread
  const thread = await threadRepository.createThread({
    title: title.trim(),
    content: content.trim(),
    userId
  });
  
  return {
    ...thread,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString()
  };
};

// Update a thread
export const updateThread = async (
  id: number,
  data: {
    title?: string;
    content?: string;
  },
  userId: number
) => {
  // Verify ownership
  const thread = await threadRepository.getThreadById(id);
  
  if (!thread) {
    throw new Error('Thread not found');
  }
  
  if (thread.userId !== userId) {
    throw new Error('You do not have permission to update this thread');
  }
  
  // Format data
  const updateData: any = {};
  
  if (data.title) {
    if (data.title.length > 255) {
      throw new Error('Title must be less than 255 characters');
    }
    updateData.title = data.title.trim();
  }
  
  if (data.content) {
    updateData.content = data.content.trim();
  }
  
  // Update thread
  const updatedThread = await threadRepository.updateThread(id, updateData);
  
  return {
    ...updatedThread,
    createdAt: updatedThread.createdAt.toISOString(),
    updatedAt: updatedThread.updatedAt.toISOString()
  };
};

// Delete a thread
export const deleteThread = async (id: number, userId: number) => {
  // Verify ownership
  const thread = await threadRepository.getThreadById(id);
  
  if (!thread) {
    throw new Error('Thread not found');
  }
  
  if (thread.userId !== userId) {
    throw new Error('You do not have permission to delete this thread');
  }
  
  // Delete thread (soft delete)
  await threadRepository.deleteThread(id);
  
  return { success: true };
};

// Get replies for a thread with pagination
export const getThreadReplies = async (
  threadId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await messageRepository.getThreadReplies(threadId, page, limit);
  
  // Format timestamps and content
  const formattedReplies = result.replies.map(reply => ({
    ...reply,
    content: formatMessage(reply.content),
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    replyCount: reply._count?.replies || 0,
    upvoteCount: reply._count?.upvotes || 0
  }));
  
  return {
    replies: formattedReplies,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};

// Get threads created by a specific user
export const getUserThreads = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await threadRepository.getUserThreads(userId, page, limit);
  
  // Format timestamps
  const formattedThreads = result.threads.map(thread => ({
    ...thread,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    replyCount: thread._count?.replies || 0
  }));
  
  return {
    threads: formattedThreads,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};