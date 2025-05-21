// src/lib/db/repositories/community/threadUpvoteRepository.ts
import prisma from '@/lib/db/prisma';

// Toggle upvote status for a thread
export const toggleThreadUpvote = async (
  threadId: number,
  userId: number
) => {
  // Check if upvote already exists
  const existingUpvote = await prisma.threadUpvote.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId
      }
    }
  });
  
  // If upvote exists, remove it
  if (existingUpvote) {
    // Start a transaction to remove upvote and decrement count
    return prisma.$transaction([
      // Delete the upvote record
      prisma.threadUpvote.delete({
        where: {
          id: existingUpvote.id
        }
      }),
      
      // Decrement the upvote count on the thread
      prisma.communityThread.update({
        where: { id: threadId },
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
      prisma.threadUpvote.create({
        data: {
          threadId,
          userId
        }
      }),
      
      // Increment the upvote count on the thread
      prisma.communityThread.update({
        where: { id: threadId },
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

// Get upvote status for a specific thread and user
export const getThreadUpvoteStatus = async (
  threadId: number,
  userId: number
) => {
  const upvote = await prisma.threadUpvote.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId
      }
    }
  });
  
  return {
    upvoted: !!upvote
  };
};