// src/lib/services/community/reportService.ts
import * as reportRepository from '@/lib/db/repositories/community/reportRepository';
import * as messageRepository from '@/lib/db/repositories/community/messageRepository';
import { formatMessage } from '@/lib/utils/formatMessage';

// Create a new report
export const createReport = async (
  messageId: number,
  reporterId: number,
  reason: string,
  details?: string
) => {
  // Check if message exists
  const message = await messageRepository.getMessageById(messageId);
  
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Check if user has already reported this message
  const hasReported = await reportRepository.hasUserReportedMessage(messageId, reporterId);
  
  if (hasReported) {
    throw new Error('You have already reported this message');
  }
  
  // Validate reason
  if (!reason) {
    throw new Error('Reason is required');
  }
  
  // Validate reason is one of the allowed options
  const allowedReasons = [
    'harassment',
    'spam',
    'misinformation',
    'inappropriate',
    'off-topic',
    'other'
  ];
  
  if (!allowedReasons.includes(reason)) {
    throw new Error('Invalid reason');
  }
  
  // Create report
  const report = await reportRepository.createReport({
    messageId,
    reporterId,
    reason,
    details: details?.trim()
  });
  
  return {
    ...report,
    createdAt: report.createdAt.toISOString(),
    message: {
      ...report.message,
      content: formatMessage(report.message.content),
      createdAt: report.message.createdAt.toISOString(),
      updatedAt: report.message.updatedAt.toISOString()
    }
  };
};

// Get reports for a message with pagination
export const getMessageReports = async (
  messageId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await reportRepository.getMessageReports(messageId, page, limit);
  
  // Format timestamps
  const formattedReports = result.reports.map(report => ({
    ...report,
    createdAt: report.createdAt.toISOString(),
    resolvedAt: report.resolvedAt ? report.resolvedAt.toISOString() : null
  }));
  
  return {
    reports: formattedReports,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};

// Get a single report by ID
export const getReportById = async (id: number) => {
  const report = await reportRepository.getReportById(id);
  
  if (!report) {
    return null;
  }
  
  return {
    ...report,
    createdAt: report.createdAt.toISOString(),
    resolvedAt: report.resolvedAt ? report.resolvedAt.toISOString() : null,
    message: {
      ...report.message,
      content: formatMessage(report.message.content),
      createdAt: report.message.createdAt.toISOString(),
      updatedAt: report.message.updatedAt.toISOString()
    }
  };
};

// Update report status (admin only)
export const updateReportStatus = async (
  id: number,
  status: string,
  resolution?: string
) => {
  // Validate status
  const allowedStatuses = ['pending', 'reviewed', 'dismissed', 'actioned'];
  
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  
  // Get report to confirm it exists
  const report = await reportRepository.getReportById(id);
  
  if (!report) {
    throw new Error('Report not found');
  }
  
  // Update report
  const updatedReport = await reportRepository.updateReportStatus(id, {
    status,
    resolution: resolution?.trim(),
    resolvedAt: status !== 'pending' ? new Date() : undefined
  });
  
  return {
    success: true,
    status: updatedReport.status
  };
};

// Get reports submitted by a user with pagination
export const getUserSubmittedReports = async (
  reporterId: number,
  page: number = 1,
  limit: number = 10
) => {
  const result = await reportRepository.getUserSubmittedReports(reporterId, page, limit);
  
  // Format timestamps
  const formattedReports = result.reports.map(report => ({
    ...report,
    createdAt: report.createdAt.toISOString(),
    resolvedAt: report.resolvedAt ? report.resolvedAt.toISOString() : null,
    message: {
      ...report.message,
      content: formatMessage(report.message.content),
      createdAt: report.message.createdAt.toISOString(),
      updatedAt: report.message.updatedAt.toISOString()
    }
  }));
  
  return {
    reports: formattedReports,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  };
};