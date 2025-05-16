// src/components/community/ThreadView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { ArrowLeft, MessageSquare, Loader2} from "lucide-react";
import Image from "next/image";
import { formatMessage } from "@/lib/utils/formatMessage";
import MessageComposer from "./MessageComposer";
import ThreadReply from "./ThreadReply";

interface Reply {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username?: string;
    avatarChoice?: string;
  };
  parentId: number;
  replies?: Reply[];
}

interface Thread {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username?: string;
    avatarChoice?: string;
  };
  moduleId: number;
  subjectId: number;
  replies: Reply[];
}

interface ThreadViewProps {
  threadId: string;
  onBack: () => void;
}

export default function ThreadView({ threadId, onBack }: ThreadViewProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/community/threads/${threadId}?page=${page}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (page === 1) {
            setThread(data.thread);
          } else if (thread) {
            // Append new replies to existing ones for pagination
            setThread({
              ...thread,
              replies: [...thread.replies, ...data.thread.replies]
            });
          }
          
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Error fetching thread:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [threadId, page]);

  const handleNewReply = async (content: string) => {
    if (!thread) return;
    
    try {
      const response = await fetch("/api/community/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          parentId: thread.id,
        }),
      });
      
      if (response.ok) {
        const newReply = await response.json();
        
        // Add the new reply to the thread
        setThread({
          ...thread,
          replies: [newReply, ...thread.replies]
        });
        
        // Hide the reply form
        setIsReplying(false);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleReplyDeleted = (replyId: number) => {
    if (!thread) return;
    
    // Remove the deleted reply from the thread
    setThread({
      ...thread,
      replies: thread.replies.filter(reply => reply.id !== replyId)
    });
  };

  if (loading && !thread) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Skeleton className="h-40" />
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Threads
        </Button>
        
        <Card className="mt-4 p-6 text-center">
          <CardContent>
            <p>Thread not found or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Threads
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{thread.title}</CardTitle>
          <CardDescription>
            Started by {thread.user.username || thread.user.name} · {formatDistance(new Date(thread.createdAt), new Date(), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={`/avatars/${thread.user.avatarChoice || 'air'}.svg`}
                alt={`${thread.user.name}'s avatar`}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatMessage(thread.content) }}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {isReplying ? "Cancel" : "Reply"}
          </Button>
        </CardFooter>
      </Card>
      
      {isReplying && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <MessageComposer
              onMessageSubmit={handleNewReply}
              parentId={thread.id}
              placeholder="Write your reply..."
              isReply
            />
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {thread.replies.length === 0 ? (
          <Card className="p-6 text-center">
            <CardContent>
              <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {thread.replies.map((reply) => (
              <ThreadReply
                key={reply.id}
                reply={reply}
                onDeleted={handleReplyDeleted}
                onReplyAdded={(newReply) => {
                  if (!thread) return;
                  
                  // Find the parent reply and add the new reply to its replies
                  const updatedReplies = thread.replies.map(r => {
                    if (r.id === newReply.parentId) {
                      return {
                        ...r,
                        replies: r.replies ? [...r.replies, newReply] : [newReply]
                      };
                    }
                    return r;
                  });
                  
                  setThread({
                    ...thread,
                    replies: updatedReplies
                  });
                }}
              />
            ))}
            
            {hasMore && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setPage(page + 1)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load More Replies"
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}