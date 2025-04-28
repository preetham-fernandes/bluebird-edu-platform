// src/lib/db/repositories/communityMessageRepository.ts
import prisma from '../prisma';
import { CommunityMessage } from '@prisma/client';

// Get messages with pagination
export const getMessages = async (
  page: number = 1,
  limit: number = 20,
  parentId: number | null = null
): Promise<{ messages: any[]; totalCount: number }> => {
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCount = await prisma.communityMessage.count({
    where: {
      parentId: parentId,
      isDeleted: false
    }
  });
  
  // Get messages with user details and reply counts
  const messages = await prisma.communityMessage.findMany({
    where: {
      parentId: parentId,
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarChoice: true
        }
      },
      _count: {
        select: {
          replies: true
        }
      }
    }
  });
  
  return { messages, totalCount };
};

// Get a single message with its replies
export const getMessageWithReplies = async (messageId: number): Promise<any | null> => {
  const message = await prisma.communityMessage.findUnique({
    where: { 
      id: messageId,
      isDeleted: false
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarChoice: true
        }
      },
      replies: {
        where: {
          isDeleted: false
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarChoice: true
            }
          }
        }
      }
    }
  });
  
  return message;
};

// Create a new message
export const createMessage = async (
  content: string,
  userId: number,
  parentId?: number
): Promise<CommunityMessage> => {
  return prisma.communityMessage.create({
    data: {
      content,
      userId,
      parentId: parentId || null
    }
  });
};

// Delete a message (soft delete)
export const deleteMessage = async (id: number): Promise<CommunityMessage> => {
  return prisma.communityMessage.update({
    where: { id },
    data: { isDeleted: true }
  });
};

// Report a message
export const reportMessage = async (
  messageId: number,
  reporterId: number,
  reason?: string
): Promise<any> => {
  return prisma.messageReport.create({
    data: {
      messageId,
      reporterId,
      reason: reason || null
    }
  });
};