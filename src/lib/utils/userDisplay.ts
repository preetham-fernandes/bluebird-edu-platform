// src/lib/utils/userDisplay.ts
import { CommunityUser } from '@/types/community';

/**
 * Returns the display name for a user - username if available, otherwise full name
 */
export function getUserDisplayName(user: CommunityUser | null | undefined): string {
  if (!user) return 'Unknown User';
  
  return user.username && user.username.trim() !== '' 
    ? user.username 
    : user.name || 'Unknown User';
}