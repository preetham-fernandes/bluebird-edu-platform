// src/lib/utils/formatMessage.ts
export function formatMessage(text: string): string {
    // Replace **text** with bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *text* with italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace new lines with <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }