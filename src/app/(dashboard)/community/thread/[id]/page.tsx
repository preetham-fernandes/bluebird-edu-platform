//app/(dashboard)/community/thread/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
import ThreadAccessGate from "@/components/user/community/ThreadAccessGate";
import { CommunityThread } from "@/types/community";
import { Skeleton } from "@/components/ui/skeleton";

interface ThreadDetailPageProps {
  params: {
    id: string;
  };
}

// Loading skeleton component for better UX during loading
const ThreadLoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-start space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
    <Skeleton className="h-32 w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export default function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  // Parse ID safely with useMemo to avoid recalculation
  const id = useMemo(() => parseInt(params.id), [params.id]);
  const router = useRouter();

  // State management
  const [thread, setThread] = useState<CommunityThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // const { loading: permissionsLoading } = useCommunityPermissions();

  // Check if ID is valid
  const isValidId = useMemo(() => !isNaN(id) && id > 0, [id]);

  // Fetch thread with useCallback for better performance
  const fetchThread = useCallback(async (isRetry = false) => {
    if (!isValidId) {
      setError("Invalid thread ID");
      setIsLoading(false);
      return;
    }

    // Use AbortController for cancelable fetch
    const controller = new AbortController();
    const { signal } = controller;

    try {
      isRetry ? setIsRetrying(true) : setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/community/threads/${id}`, {
        signal,
        cache: isRetry ? 'no-store' : 'default' // Force fresh data on retry
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          response.status === 404
            ? "Thread not found"
            : errorData.error || "Failed to fetch thread"
        );
      }

      const data = await response.json();
      setThread(data);
    } catch (err) {
      // Only set error if not aborted
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error("Error fetching thread:", err);
        setError(err instanceof Error ? err.message : "Failed to load thread");
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }

    // Cleanup function to abort fetch on unmount
    return () => controller.abort();
  }, [id, isValidId]);

  // Effect to fetch thread data
  useEffect(() => {
    const fetchData = async () => {
      await fetchThread(); // Call the async function
    };

    fetchData(); // Invoke the async function

    // No cleanup function needed here, so just return nothing
  }, [fetchThread]);

  // Retry handler
  const handleRetry = useCallback(() => {
    fetchThread(true);
  }, [fetchThread]);

  // Return to community handler
  const handleReturnToCommunity = useCallback(() => {
    router.push("/community");
  }, [router]);

  return (
    <div className="container max-w-5xl w-full py-2 space-y-4 animate-in fade-in">
      {/* Back button with hover effect */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="group hover:bg-primary/5 transition-colors" 
        asChild
      >
        <Link href="/community" prefetch={true}>
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Community</span>
        </Link>
      </Button>

      {/* Content area with proper states */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <Card className="p-6">
            <CardContent className="p-0 pt-4">
              <ThreadLoadingSkeleton />
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200/50 shadow-sm">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {error === "Thread not found" ? "Thread Not Found" : "Error Loading Thread"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {error === "Thread not found" 
                  ? "The thread you're looking for doesn't exist or has been removed."
                  : "We couldn't load this thread. Please try again."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="min-w-[120px]"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
                <Button
                  onClick={handleReturnToCommunity}
                  className="min-w-[160px]"
                >
                  Return to Community
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : thread ? (
          <ThreadAccessGate thread={thread} />
        ) : null}
      </div>
    </div>
  );
}