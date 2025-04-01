import * as testRepository from '../db/repositories/testRepository';
import * as aircraftRepository from '../db/repositories/aircraftRepository';
import * as subjectRepository from '../db/repositories/subjectRepository';
import { Test, Prisma } from '@prisma/client';

// Get all tests with their aircraft and subject data
export const getAllTests = async (): Promise<Test[]> => {
  return testRepository.getAllTests();
};

// Get tests by aircraft type
export const getTestsByAircraft = async (aircraftId: number): Promise<Test[]> => {
  return testRepository.getTestsByAircraftId(aircraftId);
};

// Get test details by ID
export const getTestById = async (id: number): Promise<Test | null> => {
  return testRepository.getTestById(id);
};

// Create a new test
export const createTest = async (data: {
  title: string;
  subjectId: number;
  aircraftId: number;
  content: Prisma.InputJsonValue;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  updatedBy: number;
}): Promise<Test | null> => {
  // Validate that subject and aircraft exist
  const subject = await subjectRepository.getSubjectById(data.subjectId);
  const aircraft = await aircraftRepository.getAircraftById(data.aircraftId);
  
  if (!subject || !aircraft) {
    return null;
  }

  return testRepository.createTest({
    ...data,
    isActive: true
  });
};

// Update an existing test
export const updateTest = async (
  id: number,
  data: {
    title?: string;
    content?: Prisma.InputJsonValue;
    totalQuestions?: number;
    passingScore?: number;
    timeLimit?: number;
    updatedBy: number;
  }
): Promise<Test | null> => {
  const test = await testRepository.getTestById(id);
  
  if (!test) {
    return null;
  }
  
  return testRepository.updateTest(id, data);
};

// Delete a test (soft delete)
export const deleteTest = async (id: number, adminId: number): Promise<Test | null> => {
  const test = await testRepository.getTestById(id);
  
  if (!test) {
    return null;
  }
  
  return testRepository.deleteTest(id, adminId);
};