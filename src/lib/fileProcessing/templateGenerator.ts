// src/lib/fileProcessing/templateGenerator.ts

/**
 * Generates a TXT template with CSV format for questions upload
 * Includes examples for regular questions, True/False questions, and questions without explanations
 */
export function generateTxtTemplate(includeSampleData = true): string {
  const header = 'Number,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Explanation';
  
  let template = header;
  
  if (includeSampleData) {
    // Example 1: Regular question with 4 options and explanation
    template += '\n1,"What is the maximum operating altitude of the B737 MAX?","40,000 feet","41,000 feet","43,000 feet","39,000 feet",B,"The maximum operating altitude is 41,000 feet pressure altitude."';
    
    // Example 2: Regular question without explanation
    template += '\n2,"With flaps 40 selected, what is the speedbrake restriction?","Speedbrake can be used fully","Must not go beyond ARMED detent","May be used at pilot\'s discretion","Use only during descent",B';
    
    // Example 3: True/False question with explanation - note the proper handling of empty fields
    template += '\n3,"Intentional selection of reverse thrust in flight is prohibited.","True","False","","",A,"Selecting reverse thrust in flight is strictly prohibited."';
    
    // Example 4: True/False question without explanation - note the proper handling of empty fields
    template += '\n4,"The minimum fuel tank temperature prior to takeoff is –43°C.","True","False","","",A';
  } else {
    // Add empty rows with various formats
    // Regular 4-option format
    template += `\n1,"","","","","","",""`;
    // 4-option without explanation
    template += `\n2,"","","","","",""`;
    // True/False with explanation - proper empty fields
    template += `\n3,"","True","False","","",A,""`;
    // True/False without explanation - proper empty fields
    template += `\n4,"","True","False","","",A`;
  }
  
  return template;
}

/**
 * Handler for template download requests - now only supports TXT
 */
export function handleTemplateDownload(format: string): { 
  data: string; 
  filename: string; 
  contentType: string; 
} {
  if (format !== 'txt') {
    throw new Error(`Unsupported template format: ${format}. Only TXT format is supported.`);
  }
  
  return {
    data: generateTxtTemplate(true),
    filename: 'questions-template.txt',
    contentType: 'text/plain'
  };
}