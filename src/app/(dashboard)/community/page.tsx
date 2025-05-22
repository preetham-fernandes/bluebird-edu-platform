//app/(dashboard)/community/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CommunityThread } from "@/types/community";
import { Loader2, MessageSquare, LogIn, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import ThreadsList from "@/components/user/community/ThreadsList";
import EmptyState from "@/components/user/community/EmptyState";
import NewThreadModal from "@/components/user/community/NewThreadModal";
import SubscriptionRequired from "@/components/user/community/SubscriptionRequired";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
import SubscriptionBanner from "@/components/user/community/SubscriptionBanner";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// Define an interface for the header props
interface CommunityHeaderProps {
  isAuthenticated: boolean;
  canCreateThreads: boolean;
  onNewThread: () => void;
  onShowSubscription: () => void;
}

// Header component for better organization
const CommunityHeader = ({ 
  isAuthenticated, 
  canCreateThreads, 
  onNewThread, 
  onShowSubscription 
}: CommunityHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Threads</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Discuss topics with fellow pilots and aviation enthusiasts
      </p>
    </div>

    {isAuthenticated ? (
      canCreateThreads ? (
        <Button onClick={onNewThread} size="default" className="w-full sm:w-auto">
          <MessageSquare className="mr-2 h-4 w-4" />
          New Thread
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={onShowSubscription}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Lock className="mr-2 h-4 w-4" />
            New Thread
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/subscriptions">Subscribe</Link>
          </Button>
        </div>
      )
    ) : (
      <Button asChild className="w-full sm:w-auto">
        <Link href="/login?callbackUrl=/community">
          <LogIn className="mr-2 h-4 w-4" />
          Sign in to Contribute
        </Link>
      </Button>
    )}
  </div>
);

// Loading skeleton component
const ThreadsLoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
  
  // Parse page from URL or default to 1
  const currentPage = useMemo(() => {
    return parseInt(searchParams.get("page") || "1");
  }, [searchParams]);

  // State management
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { canCreateThreads, loading: permissionsLoading } = useCommunityPermissions();
  const isAuthenticated = authStatus === "authenticated";

  // Memoized values
  const hasThreads = useMemo(() => {
    return threads.length > 0;
  }, [threads]);

  const showEmptyState = useMemo(() => {
    return !isLoading && !error && !hasThreads;
  }, [isLoading, error, hasThreads]);

  // Fetch threads with proper error handling
  const fetchThreads = useCallback(async (page: number, isRefresh = false) => {
    try {
      isRefresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/community/threads?page=${page}&limit=10`,
        { cache: isRefresh ? 'no-store' : 'default' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch threads");
      }

      const data = await response.json();
      setThreads(data.threads);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching threads:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to load threads. Please try again later."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load threads on page change
  useEffect(() => {
    fetchThreads(currentPage);
  }, [currentPage, fetchThreads]);

  // Handler functions with useCallback
  const handleCreateThread = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/community");
      return;
    }
    setIsModalOpen(true);
  }, [isAuthenticated, router]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/community?${params.toString()}`, { scroll: true });
  }, [router, searchParams]);

  const handleRefresh = useCallback(() => {
    fetchThreads(currentPage, true);
  }, [fetchThreads, currentPage]);

  return (
    <div className="container max-w-5xl w-full py-2 space-y-6 animate-in fade-in duration-300">
      {/* Header with action buttons */}
      <CommunityHeader
        isAuthenticated={isAuthenticated}
        canCreateThreads={canCreateThreads}
        onNewThread={handleCreateThread}
        onShowSubscription={() => setShowSubscriptionModal(true)}
      />

      {/* Subscription banner */}
      {isAuthenticated && !canCreateThreads && !permissionsLoading && (
        <div className="mt-2">
          <SubscriptionBanner />
        </div>
      )}

      {/* Main content with improved loading states */}
      <div className="mt-4">
        {isLoading ? (
          <ThreadsLoadingSkeleton />
        ) : error ? (
          <Card className="border-red-200/50 shadow-sm">
            <CardContent className="py-8 text-center flex flex-col items-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRefreshing ? "Refreshing..." : "Try Again"}
              </Button>
            </CardContent>
          </Card>
        ) : showEmptyState ? (
          <EmptyState
            title="No threads yet"
            description={
              isAuthenticated
                ? "Be the first to start a discussion"
                : "Sign in to start a discussion"
            }
            icon={<MessageSquare className="h-10 w-10 text-muted-foreground" />}
            actionLabel={isAuthenticated ? "Start Thread" : "Sign in"}
            onAction={
              isAuthenticated
                ? handleCreateThread
                : () => router.push("/login?callbackUrl=/community")
            }
            showAction={true}
          />
        ) : (
          <div className="relative">
            {isRefreshing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <ThreadsList
              threads={threads}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            
            {/* Refresh option */}
            <div className="flex justify-center mt-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Dialog
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      >
        <DialogContent className="max-w-md">
          <SubscriptionRequired type="thread" />
        </DialogContent>
      </Dialog>
    </div>
  );
}