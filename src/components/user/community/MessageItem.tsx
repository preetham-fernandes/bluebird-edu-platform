// src/components/user/community/MessageItem.tsx
"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommunityMessage } from "@/lib/types/community";
import { formatDate } from "@/lib/utils/formatMessage";
import UserAvatar from "./UserAvatar";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
import MessageActions from "./MessageActions";
import MessageReplyForm from "./MessageReplyForm";
import UpvoteButton from "./UpvoteButton";

interface MessageItemProps {
  message: CommunityMessage;
  isTopLevel?: boolean;
  depth?: number;
  className?: string;
  onReplyAdded?: (reply: CommunityMessage) => void;
  onMessageDeleted?: () => void;
}

export default function MessageItem({
  message,
  isTopLevel = false,
  depth = 0,
  className = "",
  onReplyAdded,
  onMessageDeleted,
}: MessageItemProps) {
  const { canReply, canUpvote } = useCommunityPermissions();
  const [showReplies, setShowReplies] = useState(message.replyCount > 0 ? false : true);
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState<CommunityMessage[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);

  // Load replies if not already loaded
  const loadReplies = async () => {
    if (repliesLoaded || message.replyCount === 0) return;

    try {
      setIsLoadingReplies(true);
      const response = await fetch(
        `/api/community/messages/${message.id}/replies`
      );

      if (!response.ok) {
        throw new Error("Failed to load replies");
      }

      const data = await response.json();
      setReplies(data.replies);
      setRepliesLoaded(true);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Toggle showing replies
  const toggleReplies = async () => {
    if (!repliesLoaded && message.replyCount > 0) {
      await loadReplies();
    }
    setShowReplies((prev) => !prev);
  };

  // Handle reply button click
  const handleReplyClick = () => {
    setIsReplying(true);
  };

  // Handle new reply added
  const handleReplyAdded = (newReply: CommunityMessage) => {
    // Add the new reply to the list
    setReplies([...replies, newReply]);
    setRepliesLoaded(true);

    // Ensure replies are visible
    setShowReplies(true);

    // Increment the reply count
    message.replyCount += 1;

    // Propagate to parent if needed
    if (onReplyAdded) {
      onReplyAdded(newReply);
    }
  };

  // Handle message deleted
  const handleMessageDeleted = () => {
    // Mark the message as deleted
    message.isDeleted = true;

    // Notify parent if needed
    if (onMessageDeleted) {
      onMessageDeleted();
    }
  };

  // Maximum depth for nested replies
  const MAX_DEPTH = 3;

  // Show "Continue this thread" for deeply nested replies
  const shouldShowContinueThread = depth >= MAX_DEPTH && message.replyCount > 0;

  return (
    <div className={`${className} ${isTopLevel ? "" : "ml-8 mt-4"}`}>
      <Card className={`${message.isDeleted ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          {/* Message Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <UserAvatar user={message.user} size="sm" />
              <div className="ml-2">
                <div className="font-medium text-sm">
                  {message.user.name || message.user.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </div>
              </div>
            </div>

            {!message.isDeleted && (
              <MessageActions
                messageId={message.id}
                userId={message.userId}
                onReply={handleReplyClick}
                onMessageDeleted={handleMessageDeleted}
                isTopLevel={isTopLevel}
              />
            )}
          </div>

          {/* Message Content */}
          {message.isDeleted ? (
            <div className="text-muted-foreground italic">
              This message has been deleted.
            </div>
          ) : (
            <div
              className="prose dark:prose-invert max-w-none break-words text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          )}
        </CardContent>

        {/* Message Actions */}
        {!message.isDeleted && (
          <CardFooter className="px-4 py-2 border-t flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Upvote button */}
              <UpvoteButton
                messageId={message.id}
                initialCount={message.upvoteCount}
                initialUpvoted={message.isUpvoted}
              />

              {/* Reply button */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleReplyClick}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Reply</span>
                </Button>
              )}
            </div>

            {/* Reply Count Toggle */}
            {message.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={toggleReplies}
              >
                {isLoadingReplies ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {showReplies ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        <span>Hide Replies</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        <span>
                          {message.replyCount === 1
                            ? "1 Reply"
                            : `${message.replyCount} Replies`}
                        </span>
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Reply Form */}
      {isReplying && !message.isDeleted && (
        <MessageReplyForm
          messageId={message.id}
          onReplyAdded={handleReplyAdded}
          onCancel={() => setIsReplying(false)}
        />
      )}

      {/* Nested Replies */}
      {showReplies &&
        repliesLoaded &&
        replies.length > 0 &&
        !shouldShowContinueThread && (
          <div className="space-y-3 mt-3">
            {replies.map((reply) => (
              <MessageItem
                key={reply.id}
                message={reply}
                depth={depth + 1}
                onReplyAdded={(newReply) => {
                  // Update reply count when a reply is added to a child
                  message.replyCount += 1;

                  // Propagate to parent if needed
                  if (onReplyAdded) {
                    onReplyAdded(newReply);
                  }
                }}
              />
            ))}
          </div>
        )}

      {/* "Continue this thread" for deep nesting */}
      {shouldShowContinueThread && showReplies && (
        <div className="ml-8 mt-4">
          <Button
            variant="outline"
            className="w-full justify-center"
            size="sm"
            onClick={() => {
              // In a full implementation, this would open a modal with the thread continuation
              alert(
                "Continue thread functionality will be implemented in Phase 6"
              );
            }}
          >
            <span>Continue this thread</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
