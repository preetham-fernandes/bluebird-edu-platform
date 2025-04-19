// src/lib/fileProcessing/textParser.ts
import * as XLSX from 'xlsx';
import { validateQuestionData } from './validationRules';

// Define the structure for questions
export interface QuestionOption {
  id: string; // A, B, C, D
  text: string;
}

export interface QuestionData {
  number: number;
  text: string;
  options: QuestionOption[];
  correctAnswer: string; // A, B, C, D
  explanation?: string;
}

/**
 * Parses CSV content into structured question data
 */
export async function parseCsvFile(csvContent: string): Promise<QuestionData[]> {
  try {
    // Split the CSV content into lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Check if there's a header row
    const hasHeader = lines[0].toLowerCase().includes('question') || 
                     lines[0].toLowerCase().includes('option') ||
                     lines[0].toLowerCase().includes('correct');
    
    // Start processing from the appropriate line
    const startIndex = hasHeader ? 1 : 0;
    const questions: QuestionData[] = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      // Parse CSV line, handling quoted values properly
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Don't forget to add the last value
      values.push(currentValue);
      
      // Process the values into a question object
      if (values.length < 7) {
        console.warn(`Skipping line ${i + 1} due to insufficient columns`);
        continue;
      }
      
      const questionData: QuestionData = {
        number: parseInt(values[0]) || i - startIndex + 1,
        text: values[1].replace(/^"|"$/g, '').trim(),
        options: [
          { id: 'A', text: values[2].replace(/^"|"$/g, '').trim() },
          { id: 'B', text: values[3].replace(/^"|"$/g, '').trim() },
          { id: 'C', text: values[4].replace(/^"|"$/g, '').trim() },
          { id: 'D', text: values[5].replace(/^"|"$/g, '').trim() }
        ],
        correctAnswer: values[6].replace(/^"|"$/g, '').trim(),
        explanation: values[7] ? values[7].replace(/^"|"$/g, '').trim() : undefined
      };
      
      // Validate the question data
      const validationResult = validateQuestionData(questionData);
      if (validationResult.valid) {
        questions.push(questionData);
      } else {
        console.warn(`Validation failed for question ${questionData.number}: ${validationResult.errors.join(', ')}`);
      }
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw new Error('Failed to parse CSV file: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Parses Excel file content into structured question data
 */
export async function parseExcelFile(fileBuffer: ArrayBuffer): Promise<QuestionData[]> {
  try {
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert the sheet to JSON
    const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
    
    // Check if there's a header row
    const hasHeader = data[0] && (
      String(data[0][0]).toLowerCase().includes('question') || 
      String(data[0][1]).toLowerCase().includes('question') ||
      String(data[0][2]).toLowerCase().includes('option') ||
      String(data[0][6]).toLowerCase().includes('correct')
    );
    
    // Start processing from the appropriate row
    const startIndex = hasHeader ? 1 : 0;
    const questions: QuestionData[] = [];
    
    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length < 7 || !row[1]) {
        continue;
      }
      
      const questionData: QuestionData = {
        number: parseInt(String(row[0])) || i - startIndex + 1,
        text: String(row[1]).trim(),
        options: [
          { id: 'A', text: String(row[2] || '').trim() },
          { id: 'B', text: String(row[3] || '').trim() },
          { id: 'C', text: String(row[4] || '').trim() },
          { id: 'D', text: String(row[5] || '').trim() }
        ],
        correctAnswer: String(row[6] || '').trim(),
        explanation: row[7] ? String(row[7]).trim() : undefined
      };
      
      // Validate the question data
      const validationResult = validateQuestionData(questionData);
      if (validationResult.valid) {
        questions.push(questionData);
      } else {
        console.warn(`Validation failed for question ${questionData.number}: ${validationResult.errors.join(', ')}`);
      }
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Parse a plain text file with a specific format
 * Assumes the format is similar to:
 * 
 * 1. What is the question text?
 * A) Option A
 * B) Option B
 * C) Option C
 * D) Option D
 * Answer: C
 * Explanation: This is an explanation.
 * 
 * 2. Next question...
 */
export async function parseTxtFile(txtContent: string): Promise<QuestionData[]> {
  try {
    // Split the content by question blocks
    // Look for patterns like "1. ", "2. ", etc.
    const questionBlocks = txtContent.split(/\n\s*\d+\.\s+/).filter(block => block.trim());
    
    // Add back the question numbers that were removed in the split
    const questions: QuestionData[] = [];
    
    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i];
      const lines = block.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 6) {
        console.warn(`Skipping question block ${i + 1} due to insufficient lines`);
        continue;
      }
      
      // Extract question text from the first line
      const questionText = lines[0].trim();
      
      // Extract options
      const optionA = lines.find(line => line.trim().match(/^A[\):]/) || line.trim().match(/^Option A[\):]/) || line.trim().match(/^A\./));
      const optionB = lines.find(line => line.trim().match(/^B[\):]/) || line.trim().match(/^Option B[\):]/) || line.trim().match(/^B\./));
      const optionC = lines.find(line => line.trim().match(/^C[\):]/) || line.trim().match(/^Option C[\):]/) || line.trim().match(/^C\./));
      const optionD = lines.find(line => line.trim().match(/^D[\):]/) || line.trim().match(/^Option D[\):]/) || line.trim().match(/^D\./));
      
      // Extract correct answer
      const answerLine = lines.find(line => line.trim().match(/^Answer:/) || line.trim().match(/^Correct Answer:/));
      const correctAnswer = answerLine 
        ? answerLine.replace(/^Answer:/, '').replace(/^Correct Answer:/, '').trim() 
        : '';
        
      // Extract explanation if present
      const explanationLine = lines.find(line => line.trim().match(/^Explanation:/));
      const explanation = explanationLine 
        ? explanationLine.replace(/^Explanation:/, '').trim() 
        : undefined;
      
      const questionData: QuestionData = {
        number: i + 1,
        text: questionText,
        options: [
          { id: 'A', text: optionA ? optionA.replace(/^A[\):.]\s*/, '').replace(/^Option A[\):.]\s*/, '').trim() : '' },
          { id: 'B', text: optionB ? optionB.replace(/^B[\):.]\s*/, '').replace(/^Option B[\):.]\s*/, '').trim() : '' },
          { id: 'C', text: optionC ? optionC.replace(/^C[\):.]\s*/, '').replace(/^Option C[\):.]\s*/, '').trim() : '' },
          { id: 'D', text: optionD ? optionD.replace(/^D[\):.]\s*/, '').replace(/^Option D[\):.]\s*/, '').trim() : '' }
        ],
        correctAnswer: correctAnswer,
        explanation: explanation
      };
      
      // Validate the question data
      const validationResult = validateQuestionData(questionData);
      if (validationResult.valid) {
        questions.push(questionData);
      } else {
        console.warn(`Validation failed for question ${questionData.number}: ${validationResult.errors.join(', ')}`);
      }
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing text file:', error);
    throw new Error('Failed to parse text file: ' + (error instanceof Error ? error.message : String(error)));
  }
}