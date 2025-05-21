"use client";

import { useState, useCallback, useMemo } from "react";
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
import { CommunityMessage } from "@/types/community";
import { formatDate } from "@/lib/utils/formatMessage";
import UserAvatar from "./UserAvatar";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
import MessageActions from "./MessageActions";
import MessageReplyForm from "./MessageReplyForm";
import UpvoteButton from "./UpvoteButton";
import { getUserDisplayName } from '@/lib/utils/userDisplay';

interface MessageItemProps {
  message: CommunityMessage;
  isTopLevel?: boolean;
  depth?: number;
  className?: string;
  onReplyAdded?: (reply: CommunityMessage) => void;
  onMessageDeleted?: () => void;
}

// Maximum depth for nested replies
const MAX_DEPTH = 4;

export default function MessageItem({
  message,
  isTopLevel = false,
  depth = 0,
  className = "",
  onReplyAdded,
  onMessageDeleted,
}: MessageItemProps) {
  const { canReply, canUpvote } = useCommunityPermissions();
  
  // Memoize to avoid unnecessary re-renders
  const hasReplies = useMemo(() => message.replyCount > 0, [message.replyCount]);
  const shouldShowContinueThread = useMemo(() => 
    depth >= MAX_DEPTH && hasReplies, 
    [depth, hasReplies]
  );
  
  // State management
  const [showReplies, setShowReplies] = useState(!hasReplies);
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState<CommunityMessage[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [messageData, setMessageData] = useState<CommunityMessage>(message);

  // Load replies with useCallback
  const loadReplies = useCallback(async () => {
    if (repliesLoaded || !hasReplies) return;

    try {
      setIsLoadingReplies(true);
      const response = await fetch(
        `/api/community/messages/${message.id}/replies`,
        { cache: 'no-store' }
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
  }, [message.id, repliesLoaded, hasReplies]);

  // Toggle showing replies
  const toggleReplies = useCallback(async () => {
    if (!repliesLoaded && hasReplies) {
      await loadReplies();
    }
    setShowReplies((prev) => !prev);
  }, [loadReplies, repliesLoaded, hasReplies]);

  // Handle reply button click
  const handleReplyClick = useCallback(() => {
    setIsReplying(true);
  }, []);

  // Handle new reply added
  const handleReplyAdded = useCallback((newReply: CommunityMessage) => {
    // Add the new reply to the list
    setReplies(prev => [...prev, newReply]);
    setRepliesLoaded(true);
    setIsReplying(false);

    // Ensure replies are visible
    setShowReplies(true);

    // Update message data with incremented reply count
    setMessageData(prev => ({
      ...prev,
      replyCount: (prev.replyCount || 0) + 1
    }));

    // Propagate to parent if needed
    if (onReplyAdded) {
      onReplyAdded(newReply);
    }
  }, [onReplyAdded]);

  // Handle message deleted
  const handleMessageDeleted = useCallback(() => {
    // Mark the message as deleted
    setMessageData(prev => ({
      ...prev,
      isDeleted: true
    }));

    // Notify parent if needed
    if (onMessageDeleted) {
      onMessageDeleted();
    }
  }, [onMessageDeleted]);

  // Format reply count text
  const replyCountText = useMemo(() => 
    messageData.replyCount === 1 ? "1 Reply" : `${messageData.replyCount} Replies`,
    [messageData.replyCount]
  );

  // Calculate indentation based on depth
  const indentClass = useMemo(() => {
    return isTopLevel ? "" : "ml-4 sm:ml-6";
  }, [isTopLevel]);

  // Calculate left border color and style - much more subtle than before
  const leftBorderStyle = useMemo(() => {
    if (isTopLevel) return "";
    return "border-l-[2px] border-primary/15 dark:border-primary/10 pl-3 sm:pl-4";
  }, [isTopLevel]);

  return (
    <div className={`${className} ${indentClass} mb-3`}>
      {/* Message with subtle left border for nesting */}
      <div className={`relative ${leftBorderStyle}`}>
        <Card className={`border ${messageData.isDeleted ? "opacity-60 border-muted" : "border-border/80"}`}>
          <CardContent className="p-3 sm:p-4">
            {/* Message Header */}
            <div className="flex items-start sm:items-center justify-between mb-3 gap-2">
              <div className="flex items-center">
                <UserAvatar 
                  user={messageData.user} 
                  size="sm" 
                  className="h-7 w-7 sm:h-8 sm:w-8" 
                />
                <div className="ml-2 flex flex-col">
                  <div className="font-medium text-xs sm:text-sm">
                  {getUserDisplayName(messageData.user)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1 hidden sm:inline" />
                    {formatDate(messageData.createdAt)}
                  </div>
                </div>
              </div>

              {!messageData.isDeleted && (
                <MessageActions
                  messageId={messageData.id}
                  userId={messageData.userId}
                  onReply={handleReplyClick}
                  onMessageDeleted={handleMessageDeleted}
                  isTopLevel={isTopLevel}
                />
              )}
            </div>

            {/* Message Content */}
            <div className="overflow-hidden">
              {messageData.isDeleted ? (
                <div className="text-muted-foreground italic text-sm">
                  This message has been deleted.
                </div>
              ) : (
                <div
                  className="prose dark:prose-invert max-w-none break-words text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: messageData.content }}
                />
              )}
            </div>
          </CardContent>

          {/* Message Actions */}
          {!messageData.isDeleted && (
            <CardFooter className="px-3 sm:px-4 py-1 sm:py-2 border-t flex flex-wrap gap-y-1 justify-between items-center">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Upvote button */}
                <UpvoteButton
                  messageId={messageData.id}
                  initialCount={messageData.upvoteCount}
                  initialUpvoted={messageData.isUpvoted}
                />

                {/* Reply button */}
                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm"
                    onClick={handleReplyClick}
                  >
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden xs:inline">Reply</span>
                  </Button>
                )}
              </div>

              {/* Reply Count Toggle */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 sm:h-8 text-xs sm:text-sm ml-auto"
                  onClick={toggleReplies}
                  disabled={isLoadingReplies}
                  aria-expanded={showReplies}
                >
                  {isLoadingReplies ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <>
                      {showReplies ? (
                        <>
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden xs:inline">Hide Replies</span>
                          <span className="xs:hidden">Hide</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span>{replyCountText}</span>
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Reply Form */}
      <div className={`transition-all duration-200 overflow-hidden ${isReplying ? 'max-h-72 opacity-100 mt-3 ml-4 sm:ml-6' : 'max-h-0 opacity-0'}`}>
        {isReplying && !messageData.isDeleted && (
          <MessageReplyForm
            messageId={messageData.id}
            onReplyAdded={handleReplyAdded}
            onCancel={() => setIsReplying(false)}
          />
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && repliesLoaded && replies.length > 0 && !shouldShowContinueThread && (
        <div className="mt-3">
          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              depth={depth + 1}
              onReplyAdded={(newReply) => {
                setMessageData(prev => ({
                  ...prev,
                  replyCount: (prev.replyCount || 0) + 1
                }));

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
        <div className={`mt-3 ${leftBorderStyle}`}>
          <Button
            variant="outline"
            className="w-full justify-center text-xs sm:text-sm h-8"
            size="sm"
            onClick={() => {
              alert(
                "Continue thread functionality will be implemented in Phase 6"
              );
            }}
          >
            <span>Continue this thread</span>
            <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}