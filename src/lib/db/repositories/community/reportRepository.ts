// src/lib/db/repositories/community/reportRepository.ts
import prisma from '@/lib/db/prisma';

// Create a new report
export const createReport = async (
  data: {
    messageId: number;
    reporterId: number;
    reason: string;
    details?: string;
  }
) => {
  return prisma.messageReport.create({
    data: {
      messageId: data.messageId,
      reporterId: data.reporterId,
      reason: data.reason,
      details: data.details,
      status: 'pending'
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          username: true
        }
      },
      message: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      }
    }
  });
};

// Check if user has already reported a message
export const hasUserReportedMessage = async (
  messageId: number,
  reporterId: number
) => {
  const report = await prisma.messageReport.findFirst({
    where: {
      messageId,
      reporterId
    }
  });
  
  return !!report;
};

// Get all reports for a message
export const getMessageReports = async (
  messageId: number,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.messageReport.count({
    where: { messageId }
  });
  
  const reports = await prisma.messageReport.findMany({
    where: { messageId },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          username: true
        }
      }
    }
  });
  
  return { 
    reports, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Get a single report by ID
export const getReportById = async (id: number) => {
  return prisma.messageReport.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarChoice: true
        }
      },
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
};

// Update report status
export const updateReportStatus = async (
  id: number,
  data: {
    status: string;
    resolution?: string;
    resolvedAt?: Date;
  }
) => {
  return prisma.messageReport.update({
    where: { id },
    data: {
      status: data.status,
      resolution: data.resolution,
      resolvedAt: data.resolvedAt || (data.status !== 'pending' ? new Date() : undefined)
    }
  });
};

// Get reports submitted by a user
export const getUserSubmittedReports = async (
  reporterId: number,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const totalCount = await prisma.messageReport.count({
    where: { reporterId }
  });
  
  const reports = await prisma.messageReport.findMany({
    where: { reporterId },
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
              username: true
            }
          }
        }
      }
    }
  });
  
  return { 
    reports, 
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};