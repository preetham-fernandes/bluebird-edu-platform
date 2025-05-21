// src/components/user/community/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  // Limit the number of page buttons to show
  const MAX_VISIBLE_PAGES = 5;
  
  // Function to generate page numbers to display
  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      // If the total pages is less than or equal to the max visible pages, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always show first and last page
    const pages: (number | null)[] = [1];
    
    // Calculate range of middle pages to show
    let startPage = Math.max(2, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    let endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 3);
    
    // Adjust if at the ends
    if (endPage - startPage < MAX_VISIBLE_PAGES - 3) {
      startPage = Math.max(2, endPage - (MAX_VISIBLE_PAGES - 3));
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push(null);
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push(null);
    }
    
    // Add last page
    pages.push(totalPages);
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {visiblePages.map((page, index) => (
        page === null ? (
          <span 
            key={`ellipsis-${index}`} 
            className="px-2 py-1 text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}