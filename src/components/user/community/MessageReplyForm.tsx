 // src/components/user/community/MessageReplyForm.tsx
"use client";

import { useState } from 'react';
import { Loader2, X, Lock} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCommunityPermissions } from '@/hooks/useCommunityPermissions';
import UserAvatar from './UserAvatar';
import { CommunityMessage } from '@/types/community';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface MessageReplyFormProps {
  messageId: number;
  onReplyAdded?: (reply: CommunityMessage) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export default function MessageReplyForm({ 
  messageId, 
  onReplyAdded,
  onCancel,
  autoFocus = true
}: MessageReplyFormProps) {
  const { data: session } = useSession();
  const { canReply, userId } = useCommunityPermissions();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Check if the user is authenticated
  const isAuthenticated = !!session;
  const isDisabled = !canReply || isSubmitting || content.trim().length === 0;
  
  const handleSubmit = async () => {
    if (isDisabled) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/community/messages/${messageId}/replies`, {
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
      
      // Close the form
      onCancel();
      
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
    return null;
  }
  
  if (!canReply) {
    return (
      <div className="pl-8 pt-3 pb-1">
        <Card className="p-4 border-dashed">
          <p className="text-sm text-center mb-2">
            <Lock className="h-4 w-4 mx-auto mb-1" />
            Subscription required to reply
          </p>
          <Button size="sm" asChild className="w-full">
            <Link href="/subscriptions">Subscribe Now</Link>
          </Button>
        </Card>
      </div>
    );
  }
  
  const user = session?.user ? {
    id: Number(session.user.id),
    name: session.user.name || 'User',
    username: session.user.name || 'User', // Use name as a fallback since username doesn't exist
    avatarChoice: session.user.avatarChoice || '', // Provide a default value
  } : { id: 0, name: 'User', username: '', avatarChoice: '' }; // Ensure all properties are present
  
  
  return (
    <div className="pl-8 pt-3 pb-1">
      <div className="border rounded-md p-3 bg-background">
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar user={user} size="sm" />
          <Textarea
            placeholder="Write your reply..."
            className="min-h-[80px] flex-1 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            autoFocus={autoFocus}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Reply'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}