"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CommunityThread } from "@/lib/types/community";
import { Loader2, MessageSquare, LogIn, Lock } from "lucide-react";
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

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();
  const page = parseInt(searchParams.get("page") || "1");

  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { canCreateThreads, loading: permissionsLoading } =
    useCommunityPermissions();
  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/community/threads?page=${page}&limit=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch threads");
        }

        const data = await response.json();
        setThreads(data.threads);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError("Failed to load threads. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [page]);

  const handleCreateThread = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/login?callbackUrl=/community");
      return;
    }

    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/community?${params.toString()}`);
  };

  return (
    <div className="container w-full py-2 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threads</h1>
          <p className="text-muted-foreground">
            Discuss topics with fellow pilots and aviation enthusiasts
          </p>
        </div>

        {isAuthenticated ? (
          canCreateThreads ? (
            <Button onClick={handleCreateThread} size="default">
              <MessageSquare className="mr-2 h-4 w-4" />
              New Thread
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSubscriptionModal(true)}
                variant="outline"
              >
                <Lock className="mr-2 h-4 w-4" />
                New Thread
              </Button>
              <Button asChild>
                <Link href="/subscriptions">Subscribe</Link>
              </Button>
            </div>
          )
        ) : (
          <Button asChild>
            <Link href="/login?callbackUrl=/community">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in to Contribute
            </Link>
          </Button>
        )}
      </div>
      {isAuthenticated && !canCreateThreads && (
        <div className="mt-4">
          <SubscriptionBanner />
        </div>
      )}

      {/* Main content */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.refresh()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : threads.length === 0 ? (
          <EmptyState
            title="No threads yet"
            description={
              isAuthenticated
                ? "Be the first to start a discussion"
                : "Sign in to start a discussion"
            }
            icon={<MessageSquare className="h-10 w-10" />}
            actionLabel={isAuthenticated ? "Start Thread" : "Sign in"}
            onAction={
              isAuthenticated
                ? handleCreateThread
                : () => router.push("/login?callbackUrl=/community")
            }
            showAction={true}
          />
        ) : (
          <ThreadsList
            threads={threads}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* New Thread Modal */}
      <NewThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {showSubscriptionModal && (
        <Dialog
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        >
          <DialogContent>
            <SubscriptionRequired type="thread" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
