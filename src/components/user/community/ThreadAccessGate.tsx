// src/components/user/community/ThreadAccessGate.tsx
"use client";

import { useSession } from "next-auth/react";
import { CommunityThread } from "@/lib/types/community";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Lock } from "lucide-react";
import Link from "next/link";
import ThreadDetail from "./ThreadDetail";

interface ThreadAccessGateProps {
  thread: CommunityThread;
}

export default function ThreadAccessGate({ thread }: ThreadAccessGateProps) {
  const { status } = useSession();
  
  // If loading, render thread as normal (component will update after status resolves)
  if (status === 'loading') {
    return <ThreadDetail thread={thread} />;
  }
  
  // If not authenticated, show login prompt with the thread preview
  if (status === 'unauthenticated') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{thread.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base line-clamp-4">
              <div dangerouslySetInnerHTML={{ __html: thread.content }} />
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-muted-foreground">
                Sign in to view the complete thread and participate in the discussion.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/login?callbackUrl=/community/thread/${thread.id}`}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Continue
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If authenticated, render the full thread
  return <ThreadDetail thread={thread} />;
}