// src/components/community/Message.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  MoreVertical,
  Flag,
  Trash,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMessage } from "@/lib/utils/formatMessage";
import { useSession } from "next-auth/react";
import MessageComposer from "./MessageComposer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ReportModal from "../user/community/ReportModal";

interface MessageProps {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    username?: string;
    avatarChoice?: string;
  };
  createdAt: string;
  replyCount?: number;
  replies?: MessageProps[];
  parentId?: number;
  onDelete?: () => void;
  onReply?: () => void;
}

export default function Message({
  id,
  content,
  user,
  createdAt,
  replyCount = 0,
  replies = [],
  parentId,
  onDelete,
  onReply,
}: MessageProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const isAdmin = session?.user?.role === "admin";
  const isAuthor = session?.user?.id === user.id.toString();
  const avatarSrc = user.avatarChoice
    ? `/avatars/${user.avatarChoice}.svg`
    : "/avatars/air.svg"; // Default to 'air' if no avatar is selected

  const handleDeleteMessage = async () => {
    try {
      const response = await fetch(`/api/community/messages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });

      if (onDelete) {
        onDelete();
      }

      setConfirmDelete(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message. Please try again.",
      });
    }
  };

  const handleReply = (newContent: string) => {
    setIsReplying(false);
    if (onReply) {
      onReply();
    }
  };

  const handleSuccessfulReport = () => {
    setShowReportModal(false);
    toast({
      title: "Report submitted",
      description: "Your report has been submitted for review.",
    });
  };

  const formattedCreatedAt = formatDistance(new Date(createdAt), new Date(), {
    addSuffix: true,
  });

  return (
    <div
      className={`p-4 border rounded-lg mb-3 ${
        parentId ? "ml-8 border-muted" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={avatarSrc}
            alt={`${user.name}'s avatar`}
            fill
            className="object-cover"
            quality={90}
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {user.username && user.username.trim() !== "" ? user.username : user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formattedCreatedAt}
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
            dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
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

            {replyCount > 0 && !parentId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    Hide Replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    Show {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
                  </>
                )}
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3">
              <MessageComposer
                onMessageSubmit={handleReply}
                parentId={id}
                placeholder="Write your reply..."
                isReply
              />
            </div>
          )}

          {showReplies && replies && replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {replies.map((reply) => (
                <Message
                  key={reply.id}
                  {...reply}
                  parentId={id}
                  onDelete={onReply}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        messageId={id}
        onSuccess={handleSuccessfulReport}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this message?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMessage}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
