// src/lib/fileProcessing/validationRules.ts
import { QuestionData } from './textParser';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates question data against required rules
 * Now supports True/False questions and questions without explanations
 */
export function validateQuestionData(question: QuestionData): ValidationResult {
  const errors: string[] = [];
  
  // Check question text
  if (!question.text || question.text.trim() === '') {
    errors.push('Question text is required');
  }
  
  // Check options - must have at least 2 options (for True/False)
  if (question.options.length < 2) {
    errors.push('Question must have at least 2 options (for True/False)');
    return { valid: false, errors };
  }
  
  // Check each option has content
  const emptyOptions = question.options.filter(opt => !opt.text || opt.text.trim() === '');
  if (emptyOptions.length > 0) {
    errors.push(`Option(s) ${emptyOptions.map(o => o.id).join(', ')} cannot be empty`);
  }
  
  // Check correct answer
  if (!question.correctAnswer || question.correctAnswer.trim() === '') {
    errors.push('Correct answer is required');
  } else {
    // Validate that the correct answer is one of the available options
    const availableOptionIds = question.options.map(o => o.id);
    const normalizedAnswer = question.correctAnswer.trim().toUpperCase();
    
    if (!availableOptionIds.includes(normalizedAnswer)) {
      errors.push(`Correct answer must be one of: ${availableOptionIds.join(', ')}`);
    } else {
      // Update to normalized form
      question.correctAnswer = normalizedAnswer;
    }
  }
  
  // Check that the correct answer corresponds to a valid option
  if (question.correctAnswer) {
    const correctOption = question.options.find(o => o.id === question.correctAnswer);
    if (!correctOption || !correctOption.text || correctOption.text.trim() === '') {
      errors.push(`Option ${question.correctAnswer} is marked as correct but has no content`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates the entire question set for additional rules
 */
export function validateQuestionSet(questions: QuestionData[]): ValidationResult {
  const errors: string[] = [];
  
  // Check that there are questions
  if (questions.length === 0) {
    errors.push('No valid questions found in the file');
    return { valid: false, errors };
  }
  
  // Check for duplicate question numbers
  const questionNumbers = questions.map(q => q.number);
  const uniqueNumbers = new Set(questionNumbers);
  
  if (uniqueNumbers.size !== questions.length) {
    errors.push('Duplicate question numbers found');
  }
  
  // Check for sequential question numbers
  const isSequential = questions.every((q, index) => {
    // Sort questions by number first
    const sortedQuestions = [...questions].sort((a, b) => a.number - b.number);
    return sortedQuestions[index].number === index + 1;
  });
  
  if (!isSequential) {
    errors.push('Question numbers should be sequential starting from 1');
  }
  
  // No longer requiring explanations for any questions
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Preprocesses and normalizes question data
 */
export function preprocessQuestionData(question: QuestionData): QuestionData {
  // Trim all text fields
  question.text = question.text.trim();
  question.options = question.options.map(opt => ({
    id: opt.id,
    text: opt.text.trim()
  }));
  
  // Normalize correct answer to uppercase
  question.correctAnswer = question.correctAnswer.trim().toUpperCase();
  
  // Trim explanation if present
  if (question.explanation) {
    question.explanation = question.explanation.trim();
    
    // Remove explanation if it's empty
    if (question.explanation === '') {
      delete question.explanation;
    }
  }
  
  return question;
}