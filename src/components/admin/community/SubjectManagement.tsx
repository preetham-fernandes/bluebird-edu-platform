// src/components/admin/community/SubjectManagement.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Trash, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  slug: string;
  moduleId: number;
  moduleName: string;
  threadCount: number;
}

export default function SubjectManagement() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    moduleId: "",
  });

  // Fetch subjects and modules on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch subjects and modules
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch subjects
      const subjectsResponse = await fetch("/api/admin/community/subjects");
      
      if (!subjectsResponse.ok) {
        throw new Error("Failed to fetch subjects");
      }
      
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);
      
      // Fetch modules
      const modulesResponse = await fetch("/api/admin/community/modules");
      
      if (!modulesResponse.ok) {
        throw new Error("Failed to fetch modules");
      }
      
      const modulesData = await modulesResponse.json();
      setModules(modulesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  // Handle module selection
  const handleModuleChange = (moduleId: string) => {
    setFormData({
      ...formData,
      moduleId,
    });
  };

  // Open create dialog
  const handleCreate = () => {
    setSelectedSubject(null);
    setFormData({
      name: "",
      slug: "",
      moduleId: modules.length > 0 ? modules[0].id.toString() : "",
    });
    setEditDialog(true);
  };

  // Open edit dialog
  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      slug: subject.slug,
      moduleId: subject.moduleId.toString(),
    });
    setEditDialog(true);
  };

  // Open delete dialog
  const handleDeleteClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setDeleteDialog(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.moduleId) {
      setError("Name, slug, and module are required");
      return;
    }
    
    setFormLoading(true);
    setError(null);
    
    try {
      const isEditing = !!selectedSubject;
      const url = isEditing 
        ? `/api/admin/community/subjects/${selectedSubject.id}` 
        : "/api/admin/community/subjects";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          moduleId: parseInt(formData.moduleId),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save subject");
      }
      
      const savedSubject = await response.json();
      
      // Update local state
      await fetchData(); // Refetch all data to ensure we have module names
      
      // Close dialog and show success message
      setEditDialog(false);
      toast({
        title: isEditing ? "Subject updated" : "Subject created",
        description: isEditing 
          ? `Subject "${savedSubject.name}" has been updated` 
          : `Subject "${savedSubject.name}" has been created`,
      });
    } catch (error) {
      console.error("Error saving subject:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete subject
  const handleDelete = async () => {
    if (!selectedSubject) return;
    
    setFormLoading(true);
    
    try {
      const response = await fetch(`/api/admin/community/subjects/${selectedSubject.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete subject");
      }
      
      // Remove from local state
      setSubjects(subjects.filter(s => s.id !== selectedSubject.id));
      
      // Close dialog and show success message
      setDeleteDialog(false);
      toast({
        title: "Subject deleted",
        description: `Subject "${selectedSubject.name}" has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting subject:", error);
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
      
      <div className="flex justify-end">
        <Button onClick={handleCreate} disabled={modules.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>
      
      {modules.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No modules available. Please create a module first before adding subjects.
          </AlertDescription>
        </Alert>
      ) : subjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No subjects found. Add your first subject to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Thread Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.id}</TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.slug}</TableCell>
                <TableCell>{subject.moduleName}</TableCell>
                <TableCell>{subject.threadCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(subject)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClick(subject)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSubject ? "Edit Subject" : "Create Subject"}</DialogTitle>
            <DialogDescription>
              {selectedSubject
                ? "Update an existing subject's details"
                : "Add a new subject for organizing community discussions"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleId">Module</Label>
              <Select
                value={formData.moduleId}
                onValueChange={handleModuleChange}
                disabled={formLoading}
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
            
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Navigation Systems"
                disabled={formLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g., navigation-systems"
                disabled={formLoading}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Use lowercase letters, numbers, and hyphens.
              </p>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialog(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formLoading ? "Saving..." : selectedSubject ? "Save Changes" : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subject "{selectedSubject?.name}"?
              This will also delete all threads and messages within this subject.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialog(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formLoading ? "Deleting..." : "Delete Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}