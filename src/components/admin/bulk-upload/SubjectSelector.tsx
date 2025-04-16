"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, BookText, CheckCircle2 } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  testCount?: number;
}

interface SubjectSelectorProps {
  selectedSubject: { id: number; name: string } | null;
  onSelectSubject: (subject: { id: number; name: string } | null) => void;
  aircraftId: number;
  testTypeId: number;
  onError: (error: string | null) => void;
}

export default function SubjectSelector({
  selectedSubject,
  onSelectSubject,
  aircraftId,
  testTypeId,
  onError
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        onError(null);
        
        const response = await fetch(`/api/admin/subjects?aircraftId=${aircraftId}&testTypeId=${testTypeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        onError(err instanceof Error ? err.message : 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    
    if (aircraftId && testTypeId) {
      fetchSubjects();
    }
  }, [aircraftId, testTypeId, onError]);

  const handleSelectSubject = (id: number, name: string) => {
    onSelectSubject({ id, name });
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      onError('Subject name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      onError(null);
      
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubjectName,
          aircraftId,
          testTypeId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add subject');
      }
      
      const newSubject = await response.json();
      
      // Add the new subject to the list
      setSubjects(prev => [...prev, newSubject]);
      
      // Select the newly added subject
      onSelectSubject({ id: newSubject.id, name: newSubject.name });
      
      // Show success state
      setSubmissionSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        setDialogOpen(false);
        setSubmissionSuccess(false);
        setNewSubjectName('');
      }, 1500);
      
    } catch (err) {
      console.error('Error adding subject:', err);
      onError(err instanceof Error ? err.message : 'Failed to add subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setNewSubjectName('');
      setSubmissionSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Subject</h2>
        
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Add a new subject for this aircraft and test type.
              </DialogDescription>
            </DialogHeader>
            
            {submissionSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Subject Added Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Your new subject has been added and selected.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-name">Subject Name</Label>
                    <Input 
                      id="subject-name" 
                      placeholder="e.g., 0 Limitations, Systems, Navigation"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSubject} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Adding...' : 'Add Subject'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <BookText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Subjects Available</h3>
            <p className="text-muted-foreground mb-4">
              There are no subjects for this aircraft and test type. Add your first subject to continue.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedSubject ? selectedSubject.id.toString() : ''}
          onValueChange={(value) => {
            const selected = subjects.find(s => s.id.toString() === value);
            if (selected) {
              handleSelectSubject(selected.id, selected.name);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {subjects.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedSubject?.id === item.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectSubject(item.id, item.name)}
            >
              <RadioGroupItem
                value={item.id.toString()}
                id={`subject-${item.id}`}
                className="sr-only"
              />
              <Label
                htmlFor={`subject-${item.id}`}
                className="flex items-start gap-3 cursor-pointer"
              >
                <BookText className={`h-5 w-5 mt-0.5 ${
                  selectedSubject?.id === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.testCount !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      {item.testCount === 0 
                        ? 'No tests yet' 
                        : `${item.testCount} ${item.testCount === 1 ? 'test' : 'tests'}`}
                    </div>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}