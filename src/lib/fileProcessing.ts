// src/lib/fileProcessing.ts
import * as XLSX from 'xlsx';

export interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

/**
 * Parse an Excel file containing test questions
 */
export async function parseExcelFile(buffer: ArrayBuffer): Promise<Question[]> {
  const errors: ValidationError[] = [];
  
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Validate header row
    const headerRow = rows[0] as string[];
    validateHeaders(headerRow, errors);
    
    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    // Process question rows
    const questions: Question[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as string[];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[1]) {
        continue;
      }
      
      try {
        const question = processQuestionRow(row, i);
        questions.push(question);
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            row: i + 1,
            column: 'Multiple',
            message: error.message
          });
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.map(e => `Row ${e.row}: ${e.message}`).join(', ')}`);
    }
    
    return questions;
  } catch (error) {
    console.error('Excel parsing error:', error);
    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.map(e => `Row ${e.row}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Parse a CSV file containing test questions
 */
export async function parseCsvFile(csvText: string): Promise<Question[]> {
  const errors: ValidationError[] = [];
  
  try {
    // Split lines and parse CSV
    const lines = csvText.split(/\r?\n/);
    const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
    
    // Validate header row
    const headerRow = rows[0];
    validateHeaders(headerRow, errors);
    
    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    // Process question rows
    const questions: Question[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[1]) {
        continue;
      }
      
      try {
        const question = processQuestionRow(row, i);
        questions.push(question);
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            row: i + 1,
            column: 'Multiple',
            message: error.message
          });
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.map(e => `Row ${e.row}: ${e.message}`).join(', ')}`);
    }
    
    return questions;
  } catch (error) {
    console.error('CSV parsing error:', error);
    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.map(e => `Row ${e.row}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validate the headers in the file
 */
function validateHeaders(headers: string[], errors: ValidationError[]): void {
  const requiredHeaders = [
    'Question', 'Text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct'
  ];
  
  // Check for missing required headers
  for (const required of requiredHeaders) {
    const found = headers.some(header => 
      header && header.toLowerCase().includes(required.toLowerCase())
    );
    
    if (!found) {
      errors.push({
        row: 1,
        column: required,
        message: `Missing required column: ${required}`
      });
    }
  }
}

/**
 * Process a row from the file into a Question object
 */
function processQuestionRow(row: string[], rowIndex: number): Question {
  // Extract data from row
  const questionNumber = row[0] || (rowIndex + 1).toString();
  const questionText = row[1];
  const optionA = row[2];
  const optionB = row[3];
  const optionC = row[4];
  const optionD = row[5];
  const correctAnswer = row[6]?.toUpperCase();
  const explanation = row[7] || '';
  
  // Validate required fields
  if (!questionText) {
    throw new Error('Question text is required');
  }
  
  if (!optionA || !optionB || !optionC || !optionD) {
    throw new Error('All four options (A, B, C, D) are required');
  }
  
  if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    throw new Error('Correct answer must be A, B, C, or D');
  }
  
  // Create question object
  return {
    id: questionNumber.toString(),
    text: questionText,
    options: [
      { id: 'A', text: optionA },
      { id: 'B', text: optionB },
      { id: 'C', text: optionC },
      { id: 'D', text: optionD }
    ],
    correctAnswer,
    explanation
  };
}