// src/lib/services/testService.ts
import * as testRepository from '../db/repositories/testRepository';

// Get test by ID
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

// Get practice test by ID - does not include correct answers in the response
export const getPracticeTestById = async (id: number) => {
  const test = await testRepository.getTestById(id);
  
  if (!test) {
    return null;
  }
  
  // Structure the response data without including correct answers
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
      // We include correctAnswer here because the UI will check it locally
      // In a real-world app, you might want to remove this for security
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