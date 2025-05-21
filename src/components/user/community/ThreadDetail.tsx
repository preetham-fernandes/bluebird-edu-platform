// src/components/user/community/ThreadDetail.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MessageSquare, Loader2, Trash, Edit } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CommunityThread, CommunityMessage } from '@/lib/types/community';
import { formatDate } from '@/lib/utils/formatMessage';
import UserAvatar from './UserAvatar';
import MessageItem from './MessageItem';
import ThreadReplyForm from './ThreadReplyForm';
import { useCommunityPermissions } from '@/hooks/useCommunityPermissions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ThreadDetailProps {
  thread: CommunityThread;
}

export default function ThreadDetail({ thread }: ThreadDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { canReply, userId, isAuthor, canDelete } = useCommunityPermissions();
  
  const [replies, setReplies] = useState<CommunityMessage[]>(thread.replies || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handle adding a new reply
  const handleReplyAdded = (newReply: CommunityMessage) => {
    setReplies([...replies, newReply]);
    thread.replyCount += 1;
  };
  
  // Handle deleting the thread
  const handleDeleteThread = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/community/threads/${thread.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete thread');
      }
      
      // Show success toast
      toast({
        title: 'Thread deleted',
        description: 'The thread has been deleted successfully.',
      });
      
      // Navigate back to community page
      router.push('/community');
      
    } catch (error) {
      console.error('Error deleting thread:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete thread',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };
  
  // Load more replies
  const loadMoreReplies = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const response = await fetch(`/api/community/threads/${thread.id}/replies?page=${nextPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to load more replies');
      }
      
      const data = await response.json();
      setReplies([...replies, ...data.replies]);
      setCurrentPage(nextPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading more replies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Thread Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{thread.title}</CardTitle>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(thread.createdAt)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="flex items-center mb-4">
            <UserAvatar user={thread.user} />
            <div className="ml-2">
              <div className="font-medium">
                {thread.user.name || thread.user.username}
              </div>
              <div className="text-xs text-muted-foreground">
                Thread Author
              </div>
            </div>
          </div>
          
          <div 
            className="prose dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: thread.content }}
          />
        </CardContent>
        
        {/* Thread Actions */}
        {(isAuthor(thread.userId) || canDelete(thread.userId)) && (
          <CardFooter className="pt-0 flex justify-end space-x-2">
            {isAuthor(thread.userId) && (
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete(thread.userId) && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
      
      {/* Reply Form */}
      {canReply && (
        <ThreadReplyForm 
          threadId={thread.id} 
          onReplyAdded={handleReplyAdded} 
        />
      )}
      
      {/* Replies Section */}
      <div className="space-y-1">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Replies</h2>
          <div className="ml-2 text-sm text-muted-foreground flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{thread.replyCount}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Reply List */}
        {replies.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No replies yet. {canReply ? "Be the first to reply!" : ""}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <MessageItem 
                key={reply.id} 
                message={reply} 
                isTopLevel={true}
                onReplyAdded={(newReply) => {
                  thread.replyCount += 1;
                }}
              />
            ))}
            
            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreReplies}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Replies'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Thread Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this thread? This action cannot be undone 
              and will delete all replies as well.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteThread} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Thread"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}