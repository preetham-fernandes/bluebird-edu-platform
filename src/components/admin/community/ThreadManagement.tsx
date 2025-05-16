// src/components/admin/community/ThreadManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, Trash, MessagesSquare, AlertCircle, MoveRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface Module {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  moduleId: number;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  moduleId: number;
  moduleName: string;
  subjectId: number;
  subjectName: string;
  userId: number;
  userName: string;
  replyCount: number;
}

export default function ThreadManagement() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [moveDialog, setMoveDialog] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    moduleId: "",
    subjectId: "",
    search: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch threads, modules, and subjects
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch threads
      const threadsResponse = await fetch("/api/admin/community/threads");
      
      if (!threadsResponse.ok) {
        throw new Error("Failed to fetch threads");
      }
      
      const threadsData = await threadsResponse.json();
      setThreads(threadsData);
      
      // Fetch modules
      const modulesResponse = await fetch("/api/admin/community/modules");
      
      if (!modulesResponse.ok) {
        throw new Error("Failed to fetch modules");
      }
      
      const modulesData = await modulesResponse.json();
      setModules(modulesData);
      
      // Fetch subjects
      const subjectsResponse = await fetch("/api/admin/community/subjects");
      
      if (!subjectsResponse.ok) {
        throw new Error("Failed to fetch subjects");
      }
      
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update filtered subjects when module filter changes
  useEffect(() => {
    if (filters.moduleId) {
      const moduleId = parseInt(filters.moduleId);
      setFilteredSubjects(subjects.filter(s => s.moduleId === moduleId));
      
      // Reset subject filter if it doesn't belong to the selected module
      const currentSubject = subjects.find(s => s.id === parseInt(filters.subjectId));
      if (currentSubject && currentSubject.moduleId !== moduleId) {
        setFilters(prev => ({
          ...prev,
          subjectId: "",
        }));
      }
    } else {
      setFilteredSubjects(subjects);
    }
  }, [filters.moduleId, subjects]);

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Filter threads based on current filters
  const filteredThreads = threads.filter(thread => {
    let matches = true;
    
    if (filters.moduleId && thread.moduleId !== parseInt(filters.moduleId)) {
      matches = false;
    }
    
    if (filters.subjectId && thread.subjectId !== parseInt(filters.subjectId)) {
      matches = false;
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const titleMatch = thread.title.toLowerCase().includes(search);
      const contentMatch = thread.content.toLowerCase().includes(search);
      const userMatch = thread.userName.toLowerCase().includes(search);
      
      if (!(titleMatch || contentMatch || userMatch)) {
        matches = false;
      }
    }
    
    return matches;
  });

  // Open view dialog
  const handleView = (thread: Thread) => {
    setSelectedThread(thread);
    setViewDialog(true);
  };

  // Open delete dialog
  const handleDeleteClick = (thread: Thread) => {
    setSelectedThread(thread);
    setDeleteDialog(true);
  };

  // Open move dialog
  const handleMoveClick = (thread: Thread) => {
    setSelectedThread(thread);
    setFilters(prev => ({
      ...prev,
      moduleId: thread.moduleId.toString(),
    }));
    setMoveDialog(true);
  };

  // Delete thread
  const handleDelete = async () => {
    if (!selectedThread) return;
    
    setFormLoading(true);
    
    try {
      const response = await fetch(`/api/admin/community/threads/${selectedThread.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete thread");
      }
      
      // Remove from local state
      setThreads(threads.filter(t => t.id !== selectedThread.id));
      
      // Close dialog and show success message
      setDeleteDialog(false);
      toast({
        title: "Thread deleted",
        description: `Thread "${selectedThread.title}" has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Move thread to a different subject
  const handleMove = async () => {
    if (!selectedThread || !filters.subjectId) return;
    
    // Skip if the subject hasn't changed
    if (selectedThread.subjectId === parseInt(filters.subjectId)) {
      setMoveDialog(false);
      return;
    }
    
    setFormLoading(true);
    
    try {
      const response = await fetch(`/api/admin/community/threads/${selectedThread.id}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: parseInt(filters.subjectId),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to move thread");
      }
      
      // Get updated thread data
      const updatedThread = await response.json();
      
      // Update in local state
      setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t));
      
      // Close dialog and show success message
      setMoveDialog(false);
      toast({
        title: "Thread moved",
        description: `Thread "${selectedThread.title}" has been moved to ${updatedThread.subjectName}`,
      });
    } catch (error) {
      console.error("Error moving thread:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select
            value={filters.moduleId}
            onValueChange={(value) => handleFilterChange("moduleId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modules</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={filters.subjectId}
            onValueChange={(value) => handleFilterChange("subjectId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {filteredSubjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Input
            placeholder="Search threads..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
      </div>
      
      {filteredThreads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No threads found matching the current filters.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Replies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredThreads.map((thread) => (
              <TableRow key={thread.id}>
                <TableCell className="font-medium">{thread.title}</TableCell>
                <TableCell>{thread.moduleName}</TableCell>
                <TableCell>{thread.subjectName}</TableCell>
                <TableCell>{thread.userName}</TableCell>
                <TableCell>{formatDistance(new Date(thread.createdAt), new Date(), { addSuffix: true })}</TableCell>
                <TableCell>{thread.replyCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleView(thread)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleMoveClick(thread)}>
                      <MoveRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClick(thread)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* View Thread Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedThread?.title}</DialogTitle>
            <DialogDescription>
              Posted by {selectedThread?.userName} in {selectedThread?.moduleName} &gt; {selectedThread?.subjectName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            <div className="whitespace-pre-wrap">
              {selectedThread?.content}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessagesSquare className="h-4 w-4" />
                <span>{selectedThread?.replyCount} replies</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the thread "{selectedThread?.title}"?
              This will also delete all replies to this thread.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialog(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formLoading ? "Deleting..." : "Delete Thread"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Move Thread Dialog */}
      <Dialog open={moveDialog} onOpenChange={setMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Thread</DialogTitle>
            <DialogDescription>
              Move "{selectedThread?.title}" to a different subject
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Module</label>
              <Select
                value={filters.moduleId}
                onValueChange={(value) => handleFilterChange("moduleId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Select Subject</label>
              <Select
                value={filters.subjectId}
                onValueChange={(value) => handleFilterChange("subjectId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMoveDialog(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleMove} disabled={formLoading || !filters.subjectId}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formLoading ? "Moving..." : "Move Thread"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}