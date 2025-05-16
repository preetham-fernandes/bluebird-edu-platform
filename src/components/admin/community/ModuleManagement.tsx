// src/components/admin/community/ModuleManagement.tsx
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
import { Loader2, Pencil, Trash, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: number;
  name: string;
  slug: string;
  threadCount?: number;
}

export default function ModuleManagement() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Function to fetch modules with thread counts
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/community/modules");
      
      if (!response.ok) {
        throw new Error("Failed to fetch modules");
      }
      
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Error fetching modules:", error);
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

  // Open create dialog
  const handleCreate = () => {
    setSelectedModule(null);
    setFormData({
      name: "",
      slug: "",
    });
    setEditDialog(true);
  };

  // Open edit dialog
  const handleEdit = (module: Module) => {
    setSelectedModule(module);
    setFormData({
      name: module.name,
      slug: module.slug,
    });
    setEditDialog(true);
  };

  // Open delete dialog
  const handleDeleteClick = (module: Module) => {
    setSelectedModule(module);
    setDeleteDialog(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      setError("Name and slug are required");
      return;
    }
    
    setFormLoading(true);
    setError(null);
    
    try {
      const isEditing = !!selectedModule;
      const url = isEditing 
        ? `/api/admin/community/modules/${selectedModule.id}` 
        : "/api/admin/community/modules";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save module");
      }
      
      const savedModule = await response.json();
      
      // Update local state
      if (isEditing) {
        setModules(modules.map(m => m.id === savedModule.id ? savedModule : m));
      } else {
        setModules([...modules, savedModule]);
      }
      
      // Close dialog and show success message
      setEditDialog(false);
      toast({
        title: isEditing ? "Module updated" : "Module created",
        description: isEditing 
          ? `Module "${savedModule.name}" has been updated` 
          : `Module "${savedModule.name}" has been created`,
      });
    } catch (error) {
      console.error("Error saving module:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete module
  const handleDelete = async () => {
    if (!selectedModule) return;
    
    setFormLoading(true);
    
    try {
      const response = await fetch(`/api/admin/community/modules/${selectedModule.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete module");
      }
      
      // Remove from local state
      setModules(modules.filter(m => m.id !== selectedModule.id));
      
      // Close dialog and show success message
      setDeleteDialog(false);
      toast({
        title: "Module deleted",
        description: `Module "${selectedModule.name}" has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting module:", error);
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
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>
      
      {modules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No modules found. Add your first module to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Thread Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module.id}>
                <TableCell>{module.id}</TableCell>
                <TableCell className="font-medium">{module.name}</TableCell>
                <TableCell>{module.slug}</TableCell>
                <TableCell>{module.threadCount || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(module)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClick(module)}>
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
            <DialogTitle>{selectedModule ? "Edit Module" : "Create Module"}</DialogTitle>
            <DialogDescription>
              {selectedModule
                ? "Update an existing module's details"
                : "Add a new module for organizing community discussions"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Module Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Boeing 737 MAX"
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
                placeholder="e.g., boeing-737-max"
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
                {formLoading ? "Saving..." : selectedModule ? "Save Changes" : "Create Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the module "{selectedModule?.name}"?
              This will also delete all subjects, threads, and messages within this module.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialog(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formLoading ? "Deleting..." : "Delete Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}