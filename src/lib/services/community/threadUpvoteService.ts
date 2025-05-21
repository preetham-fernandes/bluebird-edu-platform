// src/lib/services/community/threadUpvoteService.ts
import * as threadUpvoteRepository from '@/lib/db/repositories/community/threadUpvoteRepository';
import * as threadRepository from '@/lib/db/repositories/community/threadRepository';

// Toggle upvote status for a thread
export const toggleThreadUpvote = async (threadId: number, userId: number) => {
  // Check if thread exists
  const thread = await threadRepository.getThreadById(threadId);
  
  if (!thread) {
    throw new Error('Thread not found');
  }
  
  // Toggle upvote status
  const result = await threadUpvoteRepository.toggleThreadUpvote(threadId, userId);
  
  return result;
};

// Get upvote status for a thread
export const getThreadUpvoteStatus = async (threadId: number, userId: number) => {
  return threadUpvoteRepository.getThreadUpvoteStatus(threadId, userId);
};