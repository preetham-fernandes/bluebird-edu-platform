// src/lib/services/communityService.ts
import * as communityMessageRepository from '../db/repositories/communityMessageRepository';

// Get top-level messages with pagination
export const getMessages = async (page: number = 1, limit: number = 20) => {
  return communityMessageRepository.getMessages(page, limit);
};

// Get replies to a specific message
export const getReplies = async (messageId: number, page: number = 1, limit: number = 20) => {
  return communityMessageRepository.getMessages(page, limit, messageId);
};

// Get a message with all its replies
export const getMessageWithReplies = async (messageId: number) => {
  return communityMessageRepository.getMessageWithReplies(messageId);
};

// Create a new message
export const createMessage = async (content: string, userId: number, parentId?: number) => {
  return communityMessageRepository.createMessage(content, userId, parentId);
};

// Delete a message
export const deleteMessage = async (id: number) => {
  return communityMessageRepository.deleteMessage(id);
};

// Report a message
export const reportMessage = async (messageId: number, reporterId: number, reason?: string) => {
  return communityMessageRepository.reportMessage(messageId, reporterId, reason);
};

// Check if user has accepted community terms
export const hasAcceptedTerms = async (userId: number) => {
  const prisma = (await import('../db/prisma')).default;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { communityTermsAccepted: true }
  });
  
  return user?.communityTermsAccepted || false;
};

// Accept community terms
export const acceptTerms = async (userId: number) => {
  const prisma = (await import('../db/prisma')).default;
  return prisma.user.update({
    where: { id: userId },
    data: { communityTermsAccepted: true }
  });
};

// Update user avatar
export const updateAvatar = async (userId: number, avatarChoice: string) => {
  const prisma = (await import('../db/prisma')).default;
  return prisma.user.update({
    where: { id: userId },
    data: { avatarChoice }
  });
};