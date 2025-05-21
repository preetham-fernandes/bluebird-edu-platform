// src/components/user/community/ThreadReplyForm.tsx
"use client";

import { useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCommunityPermissions } from '@/hooks/useCommunityPermissions';
import UserAvatar from './UserAvatar';
import SubscriptionRequired from '@/components/user/community/SubscriptionRequired'
import { CommunityMessage } from '@/types/community';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ThreadReplyFormProps {
  threadId: number;
  onReplyAdded?: (reply: CommunityMessage) => void;
}

export default function ThreadReplyForm({ 
  threadId, 
  onReplyAdded 
}: ThreadReplyFormProps) {
  const { data: session } = useSession();
  const { canReply, userId, isAuthenticated } = useCommunityPermissions();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isDisabled = !canReply || isSubmitting || content.trim().length === 0;
  
  const handleSubmit = async () => {
    if (isDisabled) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/community/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include', // Include cookies with the request
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add reply');
      }
      
      const reply = await response.json();
      
      // Clear the form
      setContent('');
      
      // Notify parent component
      if (onReplyAdded) {
        onReplyAdded(reply);
      }
      
      // Show success toast
      toast({
        title: 'Reply added',
        description: 'Your reply has been added successfully.',
      });
      
    } catch (error) {
      console.error('Error adding reply:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add reply',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <p className="mb-4">Please sign in to join the discussion</p>
        <Button asChild>
          <Link href={`/login?callbackUrl=/community/thread/${threadId}`}>
            Sign In
          </Link>
        </Button>
      </Card>
    );
  }
  
  // If authenticated but no subscription, show subscription required
  if (isAuthenticated && !canReply) {
    return <SubscriptionRequired type="reply" />;
  }
  
  if (!canReply) {
    return null;
  }
  
  const user = session?.user ? {
    id: Number(session.user.id),
    name: session.user.name,
    username: session.user.name, // Use name as a fallback since username doesn't exist
    avatarChoice: session.user.avatarChoice || '', // Provide a default value
  } : { id: 0, name: 'User' };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <UserAvatar user={user} />
          <div className="flex-1">
            <Textarea
              placeholder="Add your reply..."
              className="min-h-[100px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
            {content.length > 0 && content.length < 10 && (
              <p className="text-sm text-destructive mt-1">
                Reply must be at least 10 characters
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Post Reply
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}