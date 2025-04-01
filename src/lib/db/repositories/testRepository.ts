import prisma from '../prisma';
import { Test, Prisma } from '@prisma/client';

export const getAllTests = async (): Promise<Test[]> => {
  return prisma.test.findMany({
    where: {
      isActive: true
    },
    include: {
      subject: true,
      aircraft: true
    },
    orderBy: {
      lastUpdated: 'desc'
    }
  });
};

export const getTestById = async (id: number): Promise<Test | null> => {
  return prisma.test.findUnique({
    where: { id },
    include: {
      subject: true,
      aircraft: true
    }
  });
};

export const getTestsByAircraftId = async (aircraftId: number): Promise<Test[]> => {
  return prisma.test.findMany({
    where: {
      aircraftId,
      isActive: true
    },
    include: {
      subject: true
    },
    orderBy: {
      title: 'asc'
    }
  });
};

export const getTestsBySubjectId = async (subjectId: number): Promise<Test[]> => {
  return prisma.test.findMany({
    where: {
      subjectId,
      isActive: true
    },
    include: {
      aircraft: true
    },
    orderBy: {
      title: 'asc'
    }
  });
};

export const createTest = async (data: { 
  title: string;
  subjectId: number;
  aircraftId: number;
  content: Prisma.InputJsonValue;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  updatedBy: number;
  isActive?: boolean;
}): Promise<Test> => {
  return prisma.test.create({
    data
  });
};

export const updateTest = async (
  id: number, 
  data: { 
    title?: string;
    content?: Prisma.InputJsonValue;
    totalQuestions?: number;
    passingScore?: number;
    timeLimit?: number;
    updatedBy: number; // This is required to track who updated the test
    isActive?: boolean;
  }
): Promise<Test> => {
  // Create a backup of the current test content
  const currentTest = await prisma.test.findUnique({
    where: { id }
  });
  
  if (currentTest && data.content) {
    // Log the change
    await prisma.testChangeLog.create({
      data: {
        testId: id,
        changedBy: data.updatedBy,
        changeType: 'updated',
        previousContent: currentTest.content as Prisma.InputJsonValue
      }
    });
  }
  
  // Update the test with new data and timestamp
  return prisma.test.update({
    where: { id },
    data: {
      ...data,
      lastUpdated: new Date()
    }
  });
};

export const deleteTest = async (id: number, adminId: number): Promise<Test> => {
  // Log the deletion
  await prisma.testChangeLog.create({
    data: {
      testId: id,
      changedBy: adminId,
      changeType: 'deleted'
    }
  });
  
  // Soft delete by setting isActive to false
  return prisma.test.update({
    where: { id },
    data: { 
      isActive: false,
      updatedBy: adminId,
      lastUpdated: new Date()
    }
  });
};