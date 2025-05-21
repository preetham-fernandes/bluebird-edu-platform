// src/lib/db/repositories/community/threadRepository.ts
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

// Get all threads with pagination
export const getThreads = async (
  page: number = 1,
  limit: number = 10,
  includeDeleted: boolean = false
) => {
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCount = await prisma.communityThread.count({
    where: {
      isDeleted: includeDeleted ? undefined : false
    }
  });
  
  // Get threads with basic user info and reply counts
  const threads = await prisma.communityThread.findMany({
    where: {
      isDeleted: includeDeleted ? undefined : false
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
  
  return { 
    threads, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Get a single thread with its replies
export const getThreadById = async (
  id: number,
  includeDeleted: boolean = false
) => {
  return prisma.communityThread.findUnique({
    where: { 
      id,
      isDeleted: includeDeleted ? undefined : false
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
          parentId: null, // Only get top-level replies
          isDeleted: includeDeleted ? undefined : false
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
          },
          _count: {
            select: {
              replies: true,
              upvotes: true
            }
          }
        },
        take: 20 // Limit initial replies to 20
      }
    }
  });
};

// Create a new thread
export const createThread = async (
  data: {
    title: string;
    content: string;
    userId: number;
  }
) => {
  return prisma.communityThread.create({
    data: {
      title: data.title,
      content: data.content,
      userId: data.userId
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
  });
};

// Update a thread
export const updateThread = async (
  id: number,
  data: {
    title?: string;
    content?: string;
    isDeleted?: boolean;
  }
) => {
  return prisma.communityThread.update({
    where: { id },
    data,
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
};

// Delete a thread (soft delete)
export const deleteThread = async (id: number) => {
  return prisma.communityThread.update({
    where: { id },
    data: { isDeleted: true }
  });
};

// Increment the reply count of a thread
export const incrementThreadReplyCount = async (id: number) => {
  return prisma.communityThread.update({
    where: { id },
    data: {
      replyCount: {
        increment: 1
      }
    }
  });
};

// Get recent threads for a specific user
export const getUserThreads = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.communityThread.count({
    where: {
      userId,
      isDeleted: false
    }
  });
  
  const threads = await prisma.communityThread.findMany({
    where: {
      userId,
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit,
    include: {
      _count: {
        select: {
          replies: true
        }
      }
    }
  });
  
  return { 
    threads, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};