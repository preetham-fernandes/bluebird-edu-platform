// src/lib/db/repositories/community/upvoteRepository.ts
import prisma from '@/lib/db/prisma';

// Toggle upvote status (add if not present, remove if already upvoted)
export const toggleUpvote = async (
  messageId: number,
  userId: number
) => {
  // Check if upvote already exists
  const existingUpvote = await prisma.messageUpvote.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId
      }
    }
  });
  
  // If upvote exists, remove it
  if (existingUpvote) {
    // Start a transaction to remove upvote and decrement count
    return prisma.$transaction([
      // Delete the upvote record
      prisma.messageUpvote.delete({
        where: {
          id: existingUpvote.id
        }
      }),
      
      // Decrement the upvote count on the message
      prisma.communityMessage.update({
        where: { id: messageId },
        data: {
          upvoteCount: {
            decrement: 1
          }
        }
      })
    ]).then(() => {
      return { 
        status: 'removed',
        upvoted: false
      };
    });
  } 
  // Otherwise, add new upvote
  else {
    // Start a transaction to add upvote and increment count
    return prisma.$transaction([
      // Create the upvote record
      prisma.messageUpvote.create({
        data: {
          messageId,
          userId
        }
      }),
      
      // Increment the upvote count on the message
      prisma.communityMessage.update({
        where: { id: messageId },
        data: {
          upvoteCount: {
            increment: 1
          }
        }
      })
    ]).then(() => {
      return { 
        status: 'added',
        upvoted: true
      };
    });
  }
};

// Get upvote status for a specific message and user
export const getUpvoteStatus = async (
  messageId: number,
  userId: number
) => {
  const upvote = await prisma.messageUpvote.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId
      }
    }
  });
  
  return {
    upvoted: !!upvote
  };
};

// Get upvotes for a message
export const getMessageUpvotes = async (
  messageId: number,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.messageUpvote.count({
    where: { messageId }
  });
  
  const upvotes = await prisma.messageUpvote.findMany({
    where: { messageId },
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
      }
    }
  });
  
  return { 
    upvotes, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Get upvoted messages for a user
export const getUserUpvotedMessages = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.messageUpvote.count({
    where: { userId }
  });
  
  const upvotedMessages = await prisma.messageUpvote.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit,
    include: {
      message: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarChoice: true
            }
          },
          thread: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });
  
  return { 
    upvotedMessages, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};