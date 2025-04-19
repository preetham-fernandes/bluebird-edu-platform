// src/lib/fileProcessing/index.ts
import { parseCsvFile, parseExcelFile, parseTxtFile, QuestionData } from './textParser';
import { validateQuestionSet, preprocessQuestionData } from './validationRules';

/**
 * Processes an uploaded file and returns parsed question data
 */
export async function processUploadedFile(
  file: File | Buffer | ArrayBuffer,
  fileName: string
): Promise<{ questions: QuestionData[]; errors: string[] }> {
  try {
    let questions: QuestionData[] = [];
    let fileContent: ArrayBuffer;
    
    // Convert file to ArrayBuffer if it's a File
    if (file instanceof File) {
      fileContent = await file.arrayBuffer();
    } else if (file instanceof Buffer) {
      fileContent = file.buffer.slice(
        file.byteOffset,
        file.byteOffset + file.byteLength
      );
    } else {
      fileContent = file;
    }
    
    // Parse based on file extension
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    switch (fileExt) {
      case 'csv':
        const csvText = new TextDecoder().decode(fileContent);
        questions = await parseCsvFile(csvText);
        break;
        
      case 'xlsx':
      case 'xls':
        questions = await parseExcelFile(fileContent);
        break;
        
      case 'txt':
        const txtText = new TextDecoder().decode(fileContent);
        questions = await parseTxtFile(txtText);
        break;
        
      default:
        throw new Error(`Unsupported file format: ${fileExt}`);
    }
    
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

export { parseCsvFile, parseExcelFile, parseTxtFile } from './textParser';
export type { QuestionData, QuestionOption } from './textParser';
export { validateQuestionData, validateQuestionSet } from './validationRules';
export { 
  generateCsvTemplate, 
  generateExcelTemplate, 
  generateTxtTemplate,
  handleTemplateDownload
} from './templateGenerator';