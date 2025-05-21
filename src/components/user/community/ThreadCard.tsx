// src/components/user/community/ThreadCard.tsx
import Link from 'next/link';
import { MessageSquare, Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommunityThread } from '@/lib/types/community';
import { formatDate } from '@/lib/utils/formatMessage';
import UserAvatar from './UserAvatar';
import { createMessagePreview } from '@/lib/utils/formatMessage';

interface ThreadCardProps {
  thread: CommunityThread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link 
            href={`/community/thread/${thread.id}`}
            className="hover:text-primary transition-colors"
          >
            <CardTitle className="text-xl line-clamp-1">{thread.title}</CardTitle>
          </Link>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(thread.createdAt)}</span>
          </div>
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
            <UserAvatar user={thread.user} size="sm" />
            <span className="ml-2 text-sm font-medium">
              {thread.user.name || thread.user.username}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>
              {thread.replyCount === 1 
                ? '1 reply' 
                : `${thread.replyCount} replies`}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary" 
          asChild
        >
          <Link href={`/community/thread/${thread.id}`}>
            View Thread
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}