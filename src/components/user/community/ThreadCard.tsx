// src/components/user/community/ThreadCard.tsx
import Link from "next/link";
import { MessageSquare, ThumbsUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommunityThread } from "@/lib/types/community";
import { formatDate } from "@/lib/utils/formatMessage";
import { createMessagePreview } from "@/lib/utils/formatMessage";

interface ThreadCardProps {
  thread: CommunityThread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <Link
        href={`/community/thread/${thread.id}`}
        className="hover:text-primary transition-colors"
      >
        <CardHeader className="pb-1">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-1">
              {thread.title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="line-clamp-2 text-muted-foreground">
            {createMessagePreview(thread.content, 180)}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground">
              Posted by {thread.user.name || thread.user.username} •{" "}
                <span>{formatDate(thread.createdAt)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground ml-auto mr-4">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>
              {thread.upvoteCount === 1
                ? "1 upvote"
                : `${thread.upvoteCount} upvotes`}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>
              {thread.replyCount === 1
                ? "1 reply"
                : `${thread.replyCount} replies`}
            </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
