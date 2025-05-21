// src/components/user/community/MessageActions.tsx
"use client";

import {
  AlertCircle,
  Edit,
  MessageSquare,
  MoreHorizontal,
  Trash,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
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
import ReportModal from "./ReportModal";

interface MessageActionsProps {
  messageId: number;
  userId: number;
  onReply?: () => void;
  onMessageDeleted?: () => void;
  isTopLevel?: boolean;
}

export default function MessageActions({
  messageId,
  userId,
  onReply,
  onMessageDeleted,
  isTopLevel = false,
}: MessageActionsProps) {
  const { canReply, canEdit, canDelete, canReport, isAuthor } =
    useCommunityPermissions();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/community/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include", // Include cookies with the request
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete message");
      }

      // Show success toast
      toast({
        title: "Message deleted",
        description: "Your message has been deleted successfully.",
      });

      // Notify parent
      if (onMessageDeleted) {
        onMessageDeleted();
      } else {
        // Refresh the page if no callback is provided
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting message:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canReply && onReply && (
            <DropdownMenuItem onClick={onReply}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
          )}

          {isAuthor(userId) && canEdit(userId) && (
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}

          {(isAuthor(userId) || canDelete(userId)) && (
            <>
              {canReply && onReply && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}

          {canReport && !isAuthor(userId) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{" "}
              {isTopLevel ? "reply" : "message"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        messageId={messageId}
        onSuccess={() => {
          setShowReportModal(false);
          toast({
            title: "Report submitted",
            description:
              "Thank you for your report. Our moderators will review it.",
          });
        }}
      />
    </>
  );
}
