// src/components/user/community/ThreadUpvoteButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCommunityPermissions } from '@/hooks/useCommunityPermissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThreadUpvoteButtonProps {
  threadId: number;
  initialCount: number;
  initialUpvoted?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
}

export default function ThreadUpvoteButton({
  threadId,
  initialCount = 0,
  initialUpvoted = false,
  size = "default",
  variant = "ghost"
}: ThreadUpvoteButtonProps) {
  const { toast } = useToast();
  const { canUpvote, isAuthenticated } = useCommunityPermissions();
  
  const [upvoteCount, setUpvoteCount] = useState(initialCount);
  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch initial upvote status when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUpvoteStatus = async () => {
        try {
          const response = await fetch(`/api/community/threads/${threadId}/upvote`);
          
          if (response.ok) {
            const data = await response.json();
            setIsUpvoted(data.upvoted);
          }
        } catch (error) {
          console.error('Error fetching thread upvote status:', error);
        }
      };
      
      fetchUpvoteStatus();
    }
  }, [threadId, isAuthenticated]);
  
  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'You need to sign in to upvote threads',
      });
      return;
    }
    
    if (!canUpvote) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/community/threads/${threadId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to upvote thread');
      }
      
      const data = await response.json();
      
      // Update UI based on the new state
      setIsUpvoted(data.upvoted);
      setUpvoteCount(prev => data.status === 'added' ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error upvoting thread:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to upvote',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`${isUpvoted ? 'text-primary' : ''} flex items-center gap-1.5`}
            onClick={handleUpvote}
            disabled={isLoading || !isAuthenticated}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{upvoteCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isUpvoted ? 'Remove upvote' : 'Upvote this thread'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}