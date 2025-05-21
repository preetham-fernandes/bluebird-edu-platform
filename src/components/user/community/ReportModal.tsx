// src/components/user/community/ReportModal.tsx
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/messages/${messageId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          details: details.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setReason('');
      setDetails('');
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping to keep our community safe.',
      });
      onSuccess();
    } catch (error) {
      console.error('Error reporting message:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.'
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

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="report-reason" disabled={isSubmitting}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment or bullying</SelectItem>
                <SelectItem value="spam">Spam or advertising</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="off-topic">Off-topic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-details">Additional details (optional)</Label>
            <Textarea
              id="report-details"
              placeholder="Please provide any additional context about this report..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
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
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}