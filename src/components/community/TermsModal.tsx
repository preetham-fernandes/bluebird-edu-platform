// src/components/community/TermsModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!accepted) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/community/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept terms");
      }

      toast({
        title: "Terms accepted",
        description: "You can now participate in the community.",
      });

      onAccept();
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept terms. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
      <DialogHeader>
    <DialogTitle>Community Guidelines</DialogTitle>
    <DialogDescription>
      Please read and accept our guidelines before participating in the community.
    </DialogDescription>
  </DialogHeader>

        <div className="space-y-4 my-4 max-h-[50vh] overflow-y-auto">
          <p className="text-sm">
            Welcome to the BlueBird-Edu Community! Before participating,
            please read and accept our community guidelines:
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Respectful Communication</h3>
            <p className="text-sm text-muted-foreground">
              Treat all community members with respect. No harassment, bullying,
              or discriminatory language will be tolerated.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Relevant Content</h3>
            <p className="text-sm text-muted-foreground">
              Keep discussions related to aviation and exam preparation.
              Off-topic conversations may be removed.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Academic Integrity</h3>
            <p className="text-sm text-muted-foreground">
              While discussion of exam topics is encouraged, sharing actual exam
              questions or materials that violate copyright is prohibited.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Moderation</h3>
            <p className="text-sm text-muted-foreground">
              Administrators may remove content that violates these guidelines.
              Repeated violations may result in account restrictions.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-4 border-t">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
          />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            I have read and agree to the BlueBird-Edu Community Guidelines
          </Label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted || isLoading}
          >
            {isLoading ? "Processing..." : "Accept & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}