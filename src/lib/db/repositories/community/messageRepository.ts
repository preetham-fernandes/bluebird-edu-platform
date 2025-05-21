// src/lib/db/repositories/community/messageRepository.ts
import prisma from '@/lib/db/prisma';

// Get all replies for a specific message
export const getReplies = async (
  messageId: number,
  page: number = 1,
  limit: number = 10,
  includeDeleted: boolean = false
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.communityMessage.count({
    where: {
      parentId: messageId,
      isDeleted: includeDeleted ? undefined : false
    }
  });
  
  const replies = await prisma.communityMessage.findMany({
    where: {
      parentId: messageId,
      isDeleted: includeDeleted ? undefined : false
    },
    orderBy: {
      createdAt: 'asc'
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
          replies: true,
          upvotes: true
        }
      }
    }
  });
  
  return { 
    replies,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Get replies for a thread (top-level replies only)
export const getThreadReplies = async (
  threadId: number,
  page: number = 1,
  limit: number = 10,
  includeDeleted: boolean = false
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.communityMessage.count({
    where: {
      threadId,
      parentId: null, // Only top-level replies
      isDeleted: includeDeleted ? undefined : false
    }
  });
  
  const replies = await prisma.communityMessage.findMany({
    where: {
      threadId,
      parentId: null, // Only top-level replies
      isDeleted: includeDeleted ? undefined : false
    },
    orderBy: {
      createdAt: 'asc'
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
          replies: true,
          upvotes: true
        }
      }
    }
  });
  
  return { 
    replies,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Get a single message with its context
export const getMessageById = async (
  id: number,
  includeDeleted: boolean = false
) => {
  return prisma.communityMessage.findUnique({
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
      thread: true,
      parentMessage: {
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
      },
      _count: {
        select: {
          replies: true,
          upvotes: true
        }
      }
    }
  });
};

// Create a new message (reply)
export const createMessage = async (
  data: {
    content: string;
    userId: number;
    threadId?: number;
    parentId?: number;
  }
) => {
  return prisma.communityMessage.create({
    data: {
      content: data.content,
      userId: data.userId,
      threadId: data.threadId,
      parentId: data.parentId
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

// Update a message
export const updateMessage = async (
  id: number,
  data: {
    content?: string;
    isDeleted?: boolean;
  }
) => {
  return prisma.communityMessage.update({
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

// Delete a message (soft delete)
export const deleteMessage = async (id: number) => {
  return prisma.communityMessage.update({
    where: { id },
    data: { isDeleted: true }
  });
};

// Get message upvote status for a specific user
export const getMessageUpvoteStatus = async (
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
  
  return !!upvote; // Convert to boolean
};

// Get recent messages for a specific user
export const getUserMessages = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.communityMessage.count({
    where: {
      userId,
      isDeleted: false
    }
  });
  
  const messages = await prisma.communityMessage.findMany({
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
      thread: {
        select: {
          id: true,
          title: true
        }
      },
      _count: {
        select: {
          replies: true,
          upvotes: true
        }
      }
    }
  });
  
  return { 
    messages, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};