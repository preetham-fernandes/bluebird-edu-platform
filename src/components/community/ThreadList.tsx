// src/components/community/ThreadList.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { MessageSquare, Plus, ArrowLeft } from "lucide-react";
import Image from "next/image";
import NewThreadModal from "./NewThreadModal";

interface Thread {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username?: string;
    avatarChoice?: string;
  };
  replyCount: number;
}

interface ThreadListProps {
  moduleId: string;
  subjectId: string;
  onBack: () => void;
}

export default function ThreadList({ moduleId, subjectId, onBack }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchThreads = async () => {
      if (!moduleId || !subjectId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/community/subjects/${subjectId}/threads`);
        
        if (response.ok) {
          const data = await response.json();
          setThreads(data);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [moduleId, subjectId]);

  const handleThreadSelect = (threadId: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("threadId", threadId.toString());
    router.push(`/community?${params.toString()}`);
  };

  const handleNewThread = async (newThread: Thread) => {
    setThreads([newThread, ...threads]);
    setShowNewThreadModal(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
          <Skeleton className="h-10 w-40" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subjects
        </Button>
        
        <Button onClick={() => setShowNewThreadModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>
      
      {threads.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="mb-4 text-muted-foreground">No discussions yet. Be the first to start a thread!</p>
            <Button onClick={() => setShowNewThreadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start a New Thread
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Card 
              key={thread.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleThreadSelect(thread.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={`/avatars/${thread.user.avatarChoice || 'air'}.svg`}
                      alt={`${thread.user.name}'s avatar`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base line-clamp-1">{thread.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {thread.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        By {thread.user.username || thread.user.name} · {formatDistance(new Date(thread.createdAt), new Date(), { addSuffix: true })}
                      </span>
                      
                      <span className="text-xs flex items-center text-muted-foreground">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <NewThreadModal 
        isOpen={showNewThreadModal}
        onClose={() => setShowNewThreadModal(false)}
        moduleId={parseInt(moduleId)}
        subjectId={parseInt(subjectId)}
        onThreadCreated={handleNewThread}
      />
    </div>
  );
}