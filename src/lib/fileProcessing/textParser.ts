// src/lib/fileProcessing/textParser.ts
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
 * Parses a text file containing CSV format data into structured question data
 */
export async function parseTxtFile(txtContent: string): Promise<QuestionData[]> {
  try {
    // Split the content into lines
    const lines = txtContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Check if there's a header row
    const hasHeader = lines[0].toLowerCase().includes('question') || 
                      lines[0].toLowerCase().includes('option') ||
                      lines[0].toLowerCase().includes('correct') ||
                      lines[0].toLowerCase().includes('number');
    
    // Start processing from the appropriate line
    const startIndex = hasHeader ? 1 : 0;
    const questions: QuestionData[] = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      try {
        const line = lines[i];
        
        // Parse line as CSV, handling quoted values properly
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
        
        console.log(`Line ${i+1}: Found ${values.length} values`);
        
        // Check for minimum required data
        if (values.length < 4) { // At minimum we need: number, question, option A, option B
          console.warn(`Line ${i + 1} has insufficient columns: found ${values.length}, expected at least 4`);
          continue;
        }
        
        // Create options array with A and B
        const options = [
          { id: 'A', text: values[2].replace(/^"|"$/g, '').trim() },
          { id: 'B', text: values[3].replace(/^"|"$/g, '').trim() }
        ];
        
        // Determine if this is a True/False question by checking if Option C and D are empty
        let isTrueFalseQuestion = false;
        
        // Check if we don't have C and D options or they're empty
        if (values.length <= 5 || 
            (values.length > 4 && values[4].trim() === '') &&
            (values.length > 5 && values[5].trim() === '')) {
          isTrueFalseQuestion = true;
        }
        
        // If not T/F, add options C and D if they exist
        if (!isTrueFalseQuestion) {
          if (values.length > 4 && values[4].trim() !== '') {
            options.push({ id: 'C', text: values[4].replace(/^"|"$/g, '').trim() });
          }
          
          if (values.length > 5 && values[5].trim() !== '') {
            options.push({ id: 'D', text: values[5].replace(/^"|"$/g, '').trim() });
          }
        }
        
        // Get correct answer and explanation based on type and available values
        let correctAnswer = '';
        let explanation: string | undefined = undefined;
        
        if (isTrueFalseQuestion) {
          // For T/F questions, correct answer is at index 6 if there are 7+ values
          // otherwise it's at position 4 (if we have just number, question, A, B, answer)
          if (values.length >= 7 && values[6].trim() !== '') {
            correctAnswer = values[6].replace(/^"|"$/g, '').trim();
            // Explanation would be at index 7 if it exists
            if (values.length >= 8 && values[7].trim() !== '') {
              explanation = values[7].replace(/^"|"$/g, '').trim();
            }
          } else if (values.length >= 5) {
            correctAnswer = values[4].replace(/^"|"$/g, '').trim();
            // Explanation would be at index 5 if it exists
            if (values.length >= 6 && values[5].trim() !== '') {
              explanation = values[5].replace(/^"|"$/g, '').trim();
            }
          }
        } else {
          // For regular questions, correct answer is at index 6
          if (values.length >= 7) {
            correctAnswer = values[6].replace(/^"|"$/g, '').trim();
            // Explanation would be at index 7 if it exists
            if (values.length >= 8 && values[7].trim() !== '') {
              explanation = values[7].replace(/^"|"$/g, '').trim();
            }
          }
        }
        
        // Create question data object
        const questionData: QuestionData = {
          number: parseInt(values[0]) || i - startIndex + 1,
          text: values[1].replace(/^"|"$/g, '').trim(),
          options: options,
          correctAnswer: correctAnswer,
        };
        
        // Add explanation if it exists
        if (explanation) {
          questionData.explanation = explanation;
        }
        
        // Validate the question data
        const validationResult = validateQuestionData(questionData);
        if (validationResult.valid) {
          questions.push(questionData);
          console.log(`Successfully parsed question ${questionData.number}`);
        } else {
          console.warn(`Validation failed for question at line ${i + 1}: ${validationResult.errors.join(', ')}`);
        }
      } catch (lineError) {
        console.error(`Error parsing line ${i + 1}:`, lineError);
        // Continue with the next line instead of failing the entire file
      }
    }
    
    if (questions.length === 0) {
      throw new Error('No valid questions found in the file');
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing text file:', error);
    throw new Error('Failed to parse text file: ' + (error instanceof Error ? error.message : String(error)));
  }
}