// src/components/user/community/UserAvatar.tsx
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommunityUser } from '@/types/community';
import { getUserDisplayName } from '@/lib/utils/userDisplay';

interface UserAvatarProps {
  user: CommunityUser;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ 
  user, 
  size = 'md', 
  className = '' 
}: UserAvatarProps) {
  // Get user initials for the fallback
  const getInitials = () => {
    if (!user) return '?';
    
    const displayName = getUserDisplayName(user);
    const parts = displayName.split(' ').filter(Boolean);
    
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Get avatar classes based on size
  const getAvatarSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      case 'md':
      default:
        return 'h-10 w-10';
    }
  };
  
  // Get fallback size
  const getFallbackSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-sm';
    }
  };
  
  // Get avatar color based on avatarChoice or generate one
  const getAvatarColor = () => {
    if (user.avatarChoice) {
      const colorMap: Record<string, string> = {
        'air': 'bg-blue-100 text-blue-700',
        'water': 'bg-cyan-100 text-cyan-700',
        'fire': 'bg-orange-100 text-orange-700',
        'earth': 'bg-green-100 text-green-700',
        'spirit': 'bg-purple-100 text-purple-700'
      };
      
      return colorMap[user.avatarChoice] || 'bg-primary/10 text-primary';
    }
    
    // Generate color based on user ID
    const colors = [
      'bg-red-100 text-red-700',
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-yellow-100 text-yellow-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];
    
    return colors[user.id % colors.length] || 'bg-primary/10 text-primary';
  };
  
  // Get the avatar image URL
  const getAvatarImageUrl = () => {
    if (!user.avatarChoice) return "";
    
    // Use the correct path to your avatar images
    return `/avatars/${user.avatarChoice}.svg`;
  };

  return (
    <Avatar className={`${getAvatarSize()} ${className}`}>
      <AvatarImage 
        src={getAvatarImageUrl()}
        alt={getUserDisplayName(user)}
      />
      <AvatarFallback className={`${getFallbackSize()} ${getAvatarColor()}`}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}