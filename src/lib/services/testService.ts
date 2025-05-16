// src/lib/services/testService.ts
import * as testRepository from '../db/repositories/testRepository';

// Get test by ID - general method used internally
export const getTestById = async (id: number) => {
  const test = await testRepository.getTestById(id);
  
  if (!test) {
    return null;
  }
  
  // Structure the response data
  return {
    id: test.id,
    title: test.title,
    aircraft: test.aircraft.name,
    aircraftId: test.aircraftId,
    subject: test.titleRef?.name || '',
    totalQuestions: test.totalQuestions,
    timeLimit: test.timeLimit,
    questions: test.questions.map(question => ({
      id: question.id,
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      options: question.options.map(option => ({
        id: option.id,
        label: option.label,
        text: option.optionText,
      })),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    })),
  };
};

// Get practice test by ID - for practice test UI
export const getPracticeTestById = async (id: number) => {
  const test = await testRepository.getPracticeTestById(id);
  
  if (!test) {
    console.log(`No practice test found with ID ${id}`); // Fixed log message
    return null;
  }
  console.log(`Found practice test: ${test.title}, Type: ${test.titleRef?.testType?.type}`); // Fixed log message

  // For practice tests, we include correctAnswer because the UI needs to check it immediately
  return {
    id: test.id,
    title: test.title,
    aircraft: test.aircraft.name,
    aircraftId: test.aircraftId,
    subject: test.titleRef?.name || '',
    totalQuestions: test.totalQuestions,
    timeLimit: test.timeLimit,
    type: 'practice',
    questions: test.questions.map(question => ({
      id: question.id,
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      options: question.options.map(option => ({
        id: option.id,
        label: option.label,
        text: option.optionText,
      })),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    })),
  };
};

// Get mock test by ID - for mock test UI
export const getMockTestById = async (id: number) => {
  const test = await testRepository.getMockTestById(id);
  
  if (!test) {
    console.log(`No mock test found with ID ${id}`); // Add logging
    return null;
  }
  console.log(`Found mock test: ${test.title}, Type: ${test.titleRef?.testType?.type}`); // Add logging

  // For mock tests, we preserve the timeLimit and include a test type marker
  return {
    id: test.id,
    title: test.title,
    aircraft: test.aircraft.name,
    aircraftId: test.aircraftId,
    subject: test.titleRef?.name || '',
    totalQuestions: test.totalQuestions,
    timeLimit: test.timeLimit, // Important for mock tests
    type: 'mock',
    questions: test.questions.map(question => ({
      id: question.id,
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      options: question.options.map(option => ({
        id: option.id,
        label: option.label,
        text: option.optionText,
      })),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    })),
  };
};

// Get tests by aircraft ID
export const getTestsByAircraftId = async (aircraftId: number) => {
  return testRepository.getTestsByAircraftId(aircraftId);
};

// Get active test by title ID
export const getActiveTestByTitleId = async (titleId: number) => {
  return testRepository.getActiveTestByTitleId(titleId);
};

// Get test by title name and aircraft
export const getTestByTitleAndAircraft = async (titleName: string, aircraftSlug: string) => {
  return testRepository.getTestByTitleAndAircraft(titleName, aircraftSlug);
};