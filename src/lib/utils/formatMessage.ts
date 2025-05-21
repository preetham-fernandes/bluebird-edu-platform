// src/lib/utils/formatMessage.ts

/**
 * Formats message content with basic markup
 * - Converts **text** to bold
 * - Converts *text* to italic
 * - Converts URLs to clickable links
 * - Handles line breaks
 */
export function formatMessage(text: string): string {
  if (!text) return '';
  
  // Replace **text** with bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace *text* with italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace URLs with clickable links
  text = text.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
  );
  
  // Replace new lines with <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

/**
 * Creates a short preview of message content for thread cards
 */
export function createMessagePreview(text: string, maxLength: number = 150): string {
  if (!text) return '';
  
  // Remove markdown formatting
  const plainText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1');
  
  // Truncate to maxLength and add ellipsis if needed
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength) + '...';
}

/**
 * Formats a date for display in the UI
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Default to formatted date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}