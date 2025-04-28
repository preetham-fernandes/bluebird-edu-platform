// src/components/community/ReportModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: number;
  onSuccess: () => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  messageId,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/messages/${messageId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setReason("");
      onSuccess();
    } catch (error) {
      console.error("Error reporting message:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Message</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <p className="text-sm mb-3">
            Please explain why you're reporting this message.
            Our moderators will review your report.
          </p>
          <Textarea
            placeholder="Reason for reporting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}