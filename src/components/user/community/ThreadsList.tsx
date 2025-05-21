// src/components/user/community/ThreadsList.tsx
import { CommunityThread } from '@/types/community';
import ThreadCard from './ThreadCard';
import Pagination from './Pagination';

interface ThreadsListProps {
  threads: CommunityThread[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ThreadsList({
  threads,
  currentPage,
  totalPages,
  onPageChange
}: ThreadsListProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}