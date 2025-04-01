import prisma from '../prisma';
import { Subject } from '@prisma/client';

export const getAllSubjects = async (): Promise<Subject[]> => {
  return prisma.subject.findMany({
    orderBy: {
      name: 'asc'
    }
  });
};

export const getSubjectById = async (id: number): Promise<Subject | null> => {
  return prisma.subject.findUnique({
    where: { id }
  });
};

export const createSubject = async (data: { 
  name: string; 
  description?: string 
}): Promise<Subject> => {
  return prisma.subject.create({
    data
  });
};

export const updateSubject = async (
  id: number, 
  data: { 
    name?: string; 
    description?: string 
  }
): Promise<Subject> => {
  return prisma.subject.update({
    where: { id },
    data
  });
};

export const deleteSubject = async (id: number): Promise<Subject> => {
  return prisma.subject.delete({
    where: { id }
  });
};