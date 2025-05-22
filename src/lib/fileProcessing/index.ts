// src/lib/fileProcessing/index.ts
import { parseTxtFile, QuestionData } from './textParser';
import { validateQuestionSet, preprocessQuestionData } from './validationRules';

/**
 * Processes an uploaded file and returns parsed question data
 * Now only supports text files with CSV format
 */
export async function processUploadedFile(
  file: File | Buffer | ArrayBuffer,
  fileName: string
): Promise<{ questions: QuestionData[]; errors: string[] }> {
  try {
    let fileContent: Uint8Array;
    
    // Convert file to Uint8Array if it's a File
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      fileContent = new Uint8Array(buffer);
    } else if (file instanceof Buffer) {
      fileContent = new Uint8Array(file.buffer.slice(
        file.byteOffset,
        file.byteOffset + file.byteLength
      ));
    } else {
      fileContent = new Uint8Array(file);
    }
    
    // Check if the file has a .txt extension
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    if (fileExt !== 'txt') {
      throw new Error(`Unsupported file format: ${fileExt}. Only .txt files are supported.`);
    }
    
    // Parse the text file
    const txtText = new TextDecoder().decode(fileContent);
    let questions = await parseTxtFile(txtText);
    
    // Preprocess all questions
    questions = questions.map(preprocessQuestionData);
    
    // Validate the entire set
    const validationResult = validateQuestionSet(questions);
    
    return {
      questions,
      errors: validationResult.errors
    };
  } catch (error) {
    console.error('Error processing file:', error);
    return {
      questions: [],
      errors: [(error instanceof Error) ? error.message : String(error)]
    };
  }
}

// Export needed functions
export { parseTxtFile } from './textParser';
export type { QuestionData, QuestionOption } from './textParser';
export { validateQuestionData, validateQuestionSet } from './validationRules';
export { generateTxtTemplate, handleTemplateDownload } from './templateGenerator';