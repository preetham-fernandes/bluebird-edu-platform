// src/lib/services/community/messageService.ts
import * as messageRepository from '@/lib/db/repositories/community/messageRepository';
import * as threadRepository from '@/lib/db/repositories/community/threadRepository';
import { formatMessage } from '@/lib/utils/formatMessage';

// Create a reply to a thread
export const createThreadReply = async (
  threadId: number,
  content: string,
  userId: number
) => {
  // Validate input
  if (!content.trim()) {
    throw new Error('Content is required');
  }
  
  // Check if thread exists
  const thread = await threadRepository.getThreadById(threadId);
  
  if (!thread) {
    throw new Error('Thread not found');
  }
  
  // Create message
  const message = await messageRepository.createMessage({
    content: content.trim(),
    userId,
    threadId
  });
  
  // Increment thread reply count
  await threadRepository.incrementThreadReplyCount(threadId);
  
  return {
    ...message,
    content: formatMessage(message.content),
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  };
};

// Create a reply to a message
export const createMessageReply = async (
  parentId: number,
  content: string,
  userId: number
) => {
  // Validate input
  if (!content.trim()) {
    throw new Error('Content is required');
  }
  
  // Check if parent message exists
  const parentMessage = await messageRepository.getMessageById(parentId);
  
  if (!parentMessage) {
    throw new Error('Parent message not found');
  }
  
  // Check if parentMessage.threadId is null
  if (parentMessage.threadId === null) {
    throw new Error('Parent message does not belong to a thread');
  }
  
  // Create message
  const message = await messageRepository.createMessage({
    content: content.trim(),
    userId,
    threadId: parentMessage.threadId,
    parentId
  });
  
  // If the parent message is part of a thread, increment thread reply count
  if (parentMessage.threadId) {
    await threadRepository.incrementThreadReplyCount(parentMessage.threadId);
  }
  
  return {
    ...message,
    content: formatMessage(message.content),
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  };
};

// Get replies to a message
export const getMessageReplies = async (
  messageId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await messageRepository.getReplies(messageId, page, limit);
  
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

// Get a single message
export const getMessageById = async (id: number) => {
  const message = await messageRepository.getMessageById(id);
  
  if (!message) {
    return null;
  }
  
  return {
    ...message,
    content: formatMessage(message.content),
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    replyCount: message._count?.replies || 0,
    upvoteCount: message._count?.upvotes || 0
  };
};

// Update a message
export const updateMessage = async (
  id: number,
  content: string,
  userId: number
) => {
  // Validate input
  if (!content.trim()) {
    throw new Error('Content is required');
  }
  
  // Verify ownership
  const message = await messageRepository.getMessageById(id);
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  if (message.userId !== userId) {
    throw new Error('You do not have permission to update this message');
  }
  
  // Update message
  const updatedMessage = await messageRepository.updateMessage(id, {
    content: content.trim()
  });
  
  return {
    ...updatedMessage,
    content: formatMessage(updatedMessage.content),
    createdAt: updatedMessage.createdAt.toISOString(),
    updatedAt: updatedMessage.updatedAt.toISOString()
  };
};

// Delete a message
export const deleteMessage = async (id: number, userId: number) => {
  // Verify ownership
  const message = await messageRepository.getMessageById(id);
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  if (message.userId !== userId) {
    throw new Error('You do not have permission to delete this message');
  }
  
  // Delete message (soft delete)
  await messageRepository.deleteMessage(id);
  
  return { success: true };
};

// Get messages created by a specific user
export const getUserMessages = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await messageRepository.getUserMessages(userId, page, limit);
  
  // Format timestamps and content
  const formattedMessages = result.messages.map(message => ({
    ...message,
    content: formatMessage(message.content),
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    replyCount: message._count?.replies || 0,
    upvoteCount: message._count?.upvotes || 0
  }));
  
  return {
    messages: formattedMessages,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};