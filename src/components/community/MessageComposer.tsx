// src/components/community/MessageComposer.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Send,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MessageComposerProps {
  onMessageSubmit: (content: string) => void;
  parentId?: number;
  placeholder?: string;
  isReply?: boolean;
}

export default function MessageComposer({
  onMessageSubmit,
  parentId,
  placeholder = "Share your thoughts with the community...",
  isReply = false,
}: MessageComposerProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleFormatting = (format: "bold" | "italic") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = content;
    if (format === "bold") {
      newText =
        content.substring(0, start) +
        `**${selectedText}**` +
        content.substring(end);
    } else if (format === "italic") {
      newText =
        content.substring(0, start) +
        `*${selectedText}*` +
        content.substring(end);
    }

    setContent(newText);
    textarea.focus();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Add this debug line to see the current session state
      console.log("Submitting message with session:", JSON.stringify(session?.user, null, 2));
      
      const response = await fetch("/api/community/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
      });
  
      // Always parse the response to get more details
      const data = await response.json();
      
      // Log the response for debugging
      console.log("Message submission response:", {
        status: response.status,
        ok: response.ok,
        data
      });
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to post message");
      }
  
      setContent("");
      onMessageSubmit(content);
      
      toast({
        title: isReply ? "Reply posted" : "Message posted",
        description: "Your message has been posted successfully.",
      });
    } catch (error) {
      console.error("Error posting message:", error);
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
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormatting("bold")}
              type="button"
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormatting("italic")}
              type="button"
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            {isReply ? "Reply" : "Post"}
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Formatting: Use **text** for bold and *text* for italic
      </p>
    </div>
  );
}