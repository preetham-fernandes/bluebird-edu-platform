// src/components/community/ThreadReply.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistance } from "date-fns";
import { MessageSquare, MoreVertical, Flag, Trash } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { formatMessage } from "@/lib/utils/formatMessage";
import MessageComposer from "./MessageComposer";
import ReportModal from "./ReportModal";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface ThreadReplyProps {
  reply: Reply;
  level?: number;
  onDeleted: (replyId: number) => void;
  onReplyAdded: (newReply: Reply) => void;
}

export default function ThreadReply({ 
  reply, 
  level = 0, 
  onDeleted,
  onReplyAdded
}: ThreadReplyProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const maxNestingLevel = 2; // Maximum nesting level before we stop indenting
  const actualLevel = Math.min(level, maxNestingLevel);
  const hasNestedReplies = reply.replies && reply.replies.length > 0;
  
  const isAdmin = session?.user?.role === "admin";
  const isAuthor = session?.user?.id === reply.user.id.toString();
  
  const handleDeleteReply = async () => {
    try {
      const response = await fetch(`/api/community/replies/${reply.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }
      
      toast({
        title: "Reply deleted",
        description: "Your reply has been deleted successfully.",
      });
      
      onDeleted(reply.id);
      setConfirmDelete(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete reply. Please try again.",
      });
    }
  };
  
  const handleNewReply = async (content: string) => {
    try {
      const response = await fetch("/api/community/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          parentId: reply.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to post reply");
      }
      
      const newReply = await response.json();
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
      
      setIsReplying(false);
      onReplyAdded(newReply);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post reply. Please try again.",
      });
    }
  };
  
  const handleSuccessfulReport = () => {
    setShowReportModal(false);
    toast({
      title: "Report submitted",
      description: "Your report has been submitted for review.",
    });
  };

  return (
    <div className={`pl-${actualLevel * 4}`}>
      <Card className={`border-l-${actualLevel > 0 ? '4' : '0'} border-l-muted`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={`/avatars/${reply.user.avatarChoice || 'air'}.svg`}
                alt={`${reply.user.name}'s avatar`}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {reply.user.username || reply.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(reply.createdAt), new Date(), { addSuffix: true })}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                    {(isAdmin || isAuthor) && (
                      <DropdownMenuItem
                        onClick={() => setConfirmDelete(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div
                className="mt-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatMessage(reply.content) }}
              />
              
              <div className="mt-3 flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  {isReplying ? "Cancel" : "Reply"}
                </Button>
                
                {hasNestedReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? "Hide Replies" : `Show ${reply.replies?.length} Replies`}
                  </Button>
                )}
              </div>
              
              {isReplying && (
                <div className="mt-3">
                  <MessageComposer
                    onMessageSubmit={handleNewReply}
                    parentId={reply.id}
                    placeholder="Write your reply..."
                    isReply
                  />
                </div>
              )}
              
              {hasNestedReplies && showReplies && (
                <div className="mt-4 space-y-3">
                  {reply.replies?.map((nestedReply) => (
                    <ThreadReply
                      key={nestedReply.id}
                      reply={nestedReply}
                      level={level + 1}
                      onDeleted={onDeleted}
                      onReplyAdded={onReplyAdded}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        messageId={reply.id}
        onSuccess={handleSuccessfulReport}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Reply</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this reply?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReply}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}