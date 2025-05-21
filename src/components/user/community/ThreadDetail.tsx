// src/components/user/community/ThreadDetail.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MessageSquare, Loader2, Trash, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommunityThread, CommunityMessage } from "@/lib/types/community";
import { formatDate } from "@/lib/utils/formatMessage";
import UserAvatar from "./UserAvatar";
import MessageItem from "./MessageItem";
import ThreadReplyForm from "./ThreadReplyForm";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
import ThreadUpvoteButton from "./ThreadUpvoteButton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ThreadDetailProps {
  thread: CommunityThread;
}

export default function ThreadDetail({ thread }: ThreadDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { canReply, userId, isAuthor, canDelete } = useCommunityPermissions();

  // State management with proper typing
  const [threadData, setThreadData] = useState<CommunityThread>(thread);
  const [replies, setReplies] = useState<CommunityMessage[]>(
    thread.replies || []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil((thread.replyCount || 0) / 10)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Memoize derived data
  const hasReplies = useMemo(() => replies.length > 0, [replies.length]);
  const canLoadMore = useMemo(
    () => currentPage < totalPages,
    [currentPage, totalPages]
  );

  // Handle reply operations with useCallback
  const handleReplyAdded = useCallback((newReply: CommunityMessage) => {
    setReplies((prev) => [...prev, newReply]);
    setThreadData((prev) => ({
      ...prev,
      replyCount: (prev.replyCount || 0) + 1,
    }));
    setShowReplyForm(false);
  }, []);

  const toggleReplyForm = useCallback(() => {
    setShowReplyForm((prev) => !prev);
  }, []);

  // Handle thread deletion with useCallback
  const handleDeleteThread = useCallback(async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/community/threads/${threadData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete thread");
      }

      toast({
        title: "Thread deleted",
        description: "The thread has been deleted successfully.",
      });

      router.push("/community");
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete thread",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }, [threadData.id, router, toast]);

  // Load more replies with useCallback
  const loadMoreReplies = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await fetch(
        `/api/community/threads/${threadData.id}/replies?page=${nextPage}&limit=10`,
        { cache: "no-store" } // Ensure we get fresh data
      );

      if (!response.ok) {
        throw new Error("Failed to load more replies");
      }

      const data = await response.json();
      setReplies((prev) => [...prev, ...data.replies]);
      setCurrentPage(nextPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading more replies:", error);
      toast({
        title: "Error loading replies",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, currentPage, totalPages, threadData.id, toast]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Thread Content */}
      <Card className="mb-2 border-border/40 shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-4">
            <UserAvatar
              user={threadData.user}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0"
            />

            <div className="flex flex-col min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold break-words overflow-hidden">
                {threadData.title}
              </CardTitle>
              <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                <span className="truncate max-w-[150px] sm:max-w-[200px] lg:max-w-xs">
                  Posted by {threadData.user.name || threadData.user.username}
                </span>
                <span aria-hidden="true">•</span>
                <span className="whitespace-nowrap flex items-center">
                  <Calendar className="h-3 w-3 mr-1 inline" />
                  {formatDate(threadData.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div
            className="prose dark:prose-invert max-w-none break-words text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: threadData.content }}
          />
        </CardContent>

        {/* Thread Actions */}
        <CardFooter className="pt-0 flex flex-wrap gap-2 justify-start">
          <ThreadUpvoteButton
            threadId={thread.id}
            initialCount={thread.upvoteCount || 0}
            initialUpvoted={thread.isUpvoted}
            variant="outline"
            size="sm"
          />
          {canReply && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleReplyForm}
              className="mr-2"
              aria-expanded={showReplyForm}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              <span>{showReplyForm ? "Cancel" : "Reply"}</span>
            </Button>
          )}

          <div className="flex flex-wrap gap-2 ml-auto">
            {canDelete(threadData.userId) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="h-9"
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Reply Form with smooth transition */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showReplyForm ? "max-h-96" : "max-h-0"
        }`}
      >
        {canReply && showReplyForm && (
          <ThreadReplyForm
            threadId={threadData.id}
            onReplyAdded={handleReplyAdded}
          />
        )}
      </div>

      {/* Replies Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center">
            <span>{threadData.replyCount || 0} Replies</span>
          </h2>

          {/* Sort options could be added here in the future */}
        </div>

        <Separator className="my-4" />

        {/* Reply List with optimized rendering */}
        {!hasReplies ? (
          <Card className="bg-muted/30">
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No replies yet.</p>
              {canReply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleReplyForm}
                  className="mt-3"
                >
                  Be the first to reply
                </Button>
              )}
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

            {/* Load More Button with better loading state */}
            {canLoadMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={loadMoreReplies}
                  disabled={isLoadingMore}
                  className="w-full sm:w-auto"
                  aria-live="polite"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Loading replies...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Replies</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        (
                        {currentPage * 10 < threadData.replyCount
                          ? `${currentPage * 10} of ${threadData.replyCount}`
                          : ""}
                        )
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Thread Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this thread? This action cannot be
              undone and will delete all replies as well.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteThread}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  <span>Delete Thread</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
