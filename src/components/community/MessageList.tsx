// src/components/community/MessageList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Message from "./Message";
import MessageComposer from "./MessageComposer";
import TermsModal from "./TermsModal";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommunityMessage } from "@/types/community";

export default function MessageList() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMessages = useCallback(async (pageNum: number, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const response = await fetch(
        `/api/community/messages?page=${pageNum}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      
      const data = await response.json();
      
      if (pageNum === 1 || refresh) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...prev, ...data.messages]);
      }
      
      setTotalCount(data.totalCount);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching messages."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  }, []);

  const checkTermsAcceptance = useCallback(async () => {
    if (!session) {
      setHasAcceptedTerms(false);
      return;
    }
    
    try {
      const response = await fetch("/api/community/terms");
      
      // Even if response is not ok, we handle it gracefully
      if (!response.ok) {
        console.warn("Terms API returned non-ok response:", response.status);
        setHasAcceptedTerms(false);
        return;
      }
      
      const data = await response.json();
      setHasAcceptedTerms(data.hasAccepted);
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
      setHasAcceptedTerms(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMessages(1);
    checkTermsAcceptance();
  }, [fetchMessages, checkTermsAcceptance]);

  const handleLoadMore = () => {
    if (messages.length < totalCount) {
      fetchMessages(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchMessages(1, true);
  };

  const handleMessageSubmit = async (content: string) => {
    // After successful submission, refresh the messages
    console.log('New message content:', content);
    await fetchMessages(1, true);
  };

  const handleDeleteMessage = () => {
    // After successful deletion, refresh the messages
    fetchMessages(1, true);
  };

  const handleTermsAcceptance = async () => {
    try {
      // Wait for the terms acceptance to be processed
      await checkTermsAcceptance();
      setShowTermsModal(false);
    } catch (error) {
      console.error("Error handling terms acceptance:", error);
    }
  };

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status === "authenticated" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Community Discussion</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>
          
          {hasAcceptedTerms ? (
            <MessageComposer onMessageSubmit={handleMessageSubmit} />
          ) : (
            <div className="border rounded-lg p-4 text-center">
              <p className="mb-3">
                To participate in the community discussion, you need to accept our community guidelines.
              </p>
              <Button onClick={() => setShowTermsModal(true)}>
                View Community Guidelines
              </Button>
            </div>
          )}
          
          <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            onAccept={handleTermsAcceptance}
          />
        </div>
      ) : (
        <Alert className="mb-6">
          <AlertDescription>
            Please sign in to participate in the community discussion.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">
            No messages yet. Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Message
              key={message.id}
              id={message.id}
              content={message.content}
              user={message.user}
              createdAt={message.createdAt}
              replyCount={message._count?.replies ?? 0}
              onDelete={handleDeleteMessage}
              onReply={() => fetchMessages(page, true)}
            />
          ))}
          
          {messages.length < totalCount && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading More...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}