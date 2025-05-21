"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCommunityPermissions } from "@/hooks/useCommunityPermissions";
import ThreadAccessGate from "@/components/user/community/ThreadAccessGate";
import { CommunityThread } from "@/lib/types/community";

interface ThreadDetailPageProps {
  params: {
    id: string;
  };
}

export default function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const id = parseInt(params.id);
  const router = useRouter();

  const [thread, setThread] = useState<CommunityThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { loading: permissionsLoading } = useCommunityPermissions();

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/community/threads/${id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Thread not found"
              : "Failed to fetch thread"
          );
        }

        const data = await response.json();
        setThread(data);
      } catch (err) {
        console.error("Error fetching thread:", err);
        setError(err instanceof Error ? err.message : "Failed to load thread");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(id)) {
      fetchThread();
    } else {
      setError("Invalid thread ID");
      setIsLoading(false);
    }
  }, [id]);

  return (
    <div className="container w-full py-0 space-y-2">
      <Button variant="ghost" size="sm" className="" asChild>
        <Link href="/community">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/community")}
          >
            Return to Community
          </Button>
        </Card>
      ) : thread ? (
        <ThreadAccessGate thread={thread} />
      ) : null}
    </div>
  );
}
