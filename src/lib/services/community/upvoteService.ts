// src/lib/services/community/upvoteService.ts
import * as upvoteRepository from '@/lib/db/repositories/community/upvoteRepository';
import * as messageRepository from '@/lib/db/repositories/community/messageRepository';
import { formatMessage } from '@/lib/utils/formatMessage';

// Toggle upvote status for a message
export const toggleUpvote = async (messageId: number, userId: number) => {
  // Check if message exists
  const message = await messageRepository.getMessageById(messageId);
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Toggle upvote status
  const result = await upvoteRepository.toggleUpvote(messageId, userId);
  
  return result;
};

// Get upvote status for a message
export const getUpvoteStatus = async (messageId: number, userId: number) => {
  return upvoteRepository.getUpvoteStatus(messageId, userId);
};

// Get upvotes for a message with pagination
export const getMessageUpvotes = async (
  messageId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await upvoteRepository.getMessageUpvotes(messageId, page, limit);
  
  // Format timestamps
  const formattedUpvotes = result.upvotes.map(upvote => ({
    ...upvote,
    createdAt: upvote.createdAt.toISOString()
  }));
  
  return {
    upvotes: formattedUpvotes,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};

// Get upvoted messages for a user with pagination
export const getUserUpvotedMessages = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await upvoteRepository.getUserUpvotedMessages(userId, page, limit);
  
  // Format timestamps and content
  const formattedUpvotedMessages = result.upvotedMessages.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    message: {
      ...item.message,
      content: formatMessage(item.message.content),
      createdAt: item.message.createdAt.toISOString(),
      updatedAt: item.message.updatedAt.toISOString()
    }
  }));
  
  return {
    upvotedMessages: formattedUpvotedMessages,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};