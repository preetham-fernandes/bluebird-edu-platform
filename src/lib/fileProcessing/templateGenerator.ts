// src/lib/fileProcessing/templateGenerator.ts
import * as XLSX from 'xlsx';

/**
 * Generates a CSV template string for questions upload
 */
export function generateCsvTemplate(includeSampleData = true): string {
  const header = 'Question Number,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Explanation';
  
  let template = header;
  
  if (includeSampleData) {
    // Add some sample rows
    template += '\n1,"What is the maximum operating altitude for this aircraft?","35,000 feet","38,000 feet","41,000 feet","45,000 feet",C,"The aircraft is certified to operate up to a maximum altitude of 41,000 feet."';
    template += '\n2,"During taxi, what is the maximum crosswind component allowed?","25 knots","35 knots","43 knots","50 knots",C,"Operations manual specifies a maximum crosswind component of 43 knots during taxi."';
    template += '\n3,"What is the minimum required fuel temperature before takeoff?","-20°C","-35°C","-43°C","-50°C",C,"Minimum fuel temperature required is -43°C as per aircraft limitations."';
  } else {
    // Add empty rows
    for (let i = 1; i <= 5; i++) {
      template += `\n${i},"","","","","","",""`;
    }
  }
  
  return template;
}

/**
 * Generates an Excel file (as ArrayBuffer) for questions upload
 */
export function generateExcelTemplate(includeSampleData = true): ArrayBuffer {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Define column headers
  const headers = [
    'Question Number', 
    'Question Text', 
    'Option A', 
    'Option B', 
    'Option C', 
    'Option D', 
    'Correct Answer', 
    'Explanation'
  ];
  
  // Create data array
  const data: (string | number)[][] = [headers];
  
  if (includeSampleData) {
    // Add sample data
    data.push([
      1, 
      'What is the maximum operating altitude for this aircraft?', 
      '35,000 feet', 
      '38,000 feet', 
      '41,000 feet', 
      '45,000 feet', 
      'C', 
      'The aircraft is certified to operate up to a maximum altitude of 41,000 feet.'
    ]);
    
    data.push([
      2, 
      'During taxi, what is the maximum crosswind component allowed?', 
      '25 knots', 
      '35 knots', 
      '43 knots', 
      '50 knots', 
      'C', 
      'Operations manual specifies a maximum crosswind component of 43 knots during taxi.'
    ]);
    
    data.push([
      3, 
      'What is the minimum required fuel temperature before takeoff?', 
      '-20°C', 
      '-35°C', 
      '-43°C', 
      '-50°C', 
      'C', 
      'Minimum fuel temperature required is -43°C as per aircraft limitations.'
    ]);
  } else {
    // Add empty rows
    for (let i = 1; i <= 5; i++) {
      data.push([i, '', '', '', '', '', '', '']);
    }
  }
  
  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
  
  // Set column widths
  const cols = [
    { wch: 15 }, // Question Number
    { wch: 50 }, // Question Text
    { wch: 25 }, // Option A
    { wch: 25 }, // Option B
    { wch: 25 }, // Option C
    { wch: 25 }, // Option D
    { wch: 15 }, // Correct Answer
    { wch: 50 }  // Explanation
  ];
  
  worksheet['!cols'] = cols;
  
  // Generate ArrayBuffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  return excelBuffer;
}

/**
 * Generates a TXT template string for questions upload
 */
export function generateTxtTemplate(includeSampleData = true): string {
  let template = "# Questions Template\n";
  template += "# Format: Question Number. Question Text\n";
  template += "# A) Option A\n";
  template += "# B) Option B\n";
  template += "# C) Option C\n";
  template += "# D) Option D\n";
  template += "# Answer: Correct Option (A, B, C, or D)\n";
  template += "# Explanation: Explanation text\n\n";
  
  if (includeSampleData) {
    // Sample question 1
    template += "1. What is the maximum operating altitude for this aircraft?\n";
    template += "A) 35,000 feet\n";
    template += "B) 38,000 feet\n";
    template += "C) 41,000 feet\n";
    template += "D) 45,000 feet\n";
    template += "Answer: C\n";
    template += "Explanation: The aircraft is certified to operate up to a maximum altitude of 41,000 feet.\n\n";
    
    // Sample question 2
    template += "2. During taxi, what is the maximum crosswind component allowed?\n";
    template += "A) 25 knots\n";
    template += "B) 35 knots\n";
    template += "C) 43 knots\n";
    template += "D) 50 knots\n";
    template += "Answer: C\n";
    template += "Explanation: Operations manual specifies a maximum crosswind component of 43 knots during taxi.\n\n";
    
    // Sample question 3
    template += "3. What is the minimum required fuel temperature before takeoff?\n";
    template += "A) -20°C\n";
    template += "B) -35°C\n";
    template += "C) -43°C\n";
    template += "D) -50°C\n";
    template += "Answer: C\n";
    template += "Explanation: Minimum fuel temperature required is -43°C as per aircraft limitations.\n\n";
  } else {
    // Empty template
    for (let i = 1; i <= 3; i++) {
      template += `${i}. [Question Text]\n`;
      template += "A) [Option A]\n";
      template += "B) [Option B]\n";
      template += "C) [Option C]\n";
      template += "D) [Option D]\n";
      template += "Answer: [Correct Option]\n";
      template += "Explanation: [Explanation Text]\n\n";
    }
  }
  
  return template;
}

/**
 * Handler for template download requests
 */
export function handleTemplateDownload(format: 'csv' | 'xlsx' | 'txt'): { 
  data: string | ArrayBuffer; 
  filename: string; 
  contentType: string; 
} {
  switch (format) {
    case 'csv':
      return {
        data: generateCsvTemplate(true),
        filename: 'questions-template.csv',
        contentType: 'text/csv'
      };
      
    case 'xlsx':
      return {
        data: generateExcelTemplate(true),
        filename: 'questions-template.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
    case 'txt':
      return {
        data: generateTxtTemplate(true),
        filename: 'questions-template.txt',
        contentType: 'text/plain'
      };
      
    default:
      throw new Error(`Unsupported template format: ${format}`);
  }
}