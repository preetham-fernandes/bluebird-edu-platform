// src/components/user/community/ThreadCard.tsx
import Link from "next/link";
import { useMemo } from "react";
import { MessageSquare, ThumbsUp, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommunityThread } from "@/types/community";
import { formatDate } from "@/lib/utils/formatMessage";
import { createMessagePreview } from "@/lib/utils/formatMessage";
import { getUserDisplayName } from '@/lib/utils/userDisplay';

interface ThreadCardProps {
  thread: CommunityThread;
  className?: string;
}

export default function ThreadCard({ thread, className = "" }: ThreadCardProps) {
  // Memoize formatted values to avoid recalculations on re-renders
  const formattedDate = useMemo(() => formatDate(thread.createdAt), [thread.createdAt]);
  const contentPreview = useMemo(() => 
    createMessagePreview(thread.content, 180), 
    [thread.content]
  );
  
  // Format reply and upvote counts with proper pluralization
  const replyText = useMemo(() => 
    `${thread.replyCount || 0} ${thread.replyCount === 1 ? 'reply' : 'replies'}`,
    [thread.replyCount]
  );
  
  const upvoteText = useMemo(() => 
    `${thread.upvoteCount || 0} ${thread.upvoteCount === 1 ? 'upvote' : 'upvotes'}`,
    [thread.upvoteCount]
  );

  return (
    <Card 
      className={`group transition-all duration-200 hover:shadow-md hover:border-primary/50 ${className}`}
    >
      <Link
        href={`/community/thread/${thread.id}`}
        className="block h-full hover:text-primary transition-colors"
        aria-label={`View thread: ${thread.title}`}
      >
        <CardHeader className="pb-1">
          <CardTitle className="text-base sm:text-xl font-semibold line-clamp-1 break-words pr-3 group-hover:text-primary transition-colors">
            {thread.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="line-clamp-2 text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
            {contentPreview}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-y-2 items-center justify-between pt-0">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <span className="truncate max-w-[120px] sm:max-w-none">
            {getUserDisplayName(thread.user)}
            </span>
            <span className="mx-1">•</span>
            <span className="flex items-center whitespace-nowrap">
              <Calendar className="h-3 w-3 mr-1 inline-block" />
              {formattedDate}
            </span>
          </div>

          <div className="flex ml-auto gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center" title={upvoteText}>
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              <span className="tabular-nums">{thread.upvoteCount || 0}</span>
            </div>

            <div className="flex items-center" title={replyText}>
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              <span className="tabular-nums">{thread.replyCount || 0}</span>
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}