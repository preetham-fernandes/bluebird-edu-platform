// src/components/admin/SubjectsGrid.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Upload, 
  Plus, 
  RefreshCw, 
  Trash2, 
  AlertCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import TestUploadModal from './TestUploadModal';

interface Subject {
  id: number;
  name: string;
}

interface Test {
  id: number;
  title: string;
  subjectId: number;
  totalQuestions: number;
  lastUpdated: string;
  isActive: boolean;
}

interface SubjectsGridProps {
  aircraftId: number;
  aircraftName: string;
  testType: 'mock' | 'practice';
}

export default function SubjectsGrid({ 
  aircraftId,
  aircraftName,
  testType
}: SubjectsGridProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  
  // Fetch subjects and tests data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects
        const subjectsResponse = await fetch(`/api/admin/subjects?aircraftId=${aircraftId}`);
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
        
        // Fetch tests
        const testsResponse = await fetch(`/api/admin/tests?aircraftId=${aircraftId}&testType=${testType}`);
        if (!testsResponse.ok) {
          throw new Error('Failed to fetch tests');
        }
        const testsData = await testsResponse.json();
        setTests(testsData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [aircraftId, testType]);
  
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubjectName,
          aircraftId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add subject');
      }
      
      const newSubject = await response.json();
      setSubjects([...subjects, newSubject]);
      setNewSubjectName('');
      setIsAddSubjectOpen(false);
    } catch (err) {
      console.error('Error adding subject:', err);
    }
  };
  
  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/tests/${testToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete test');
      }
      
      // Remove test from list or mark as inactive
      const updatedTests = tests.filter(test => test.id !== testToDelete.id);
      setTests(updatedTests);
      setIsDeleteConfirmOpen(false);
      setTestToDelete(null);
    } catch (err) {
      console.error('Error deleting test:', err);
    }
  };
  
  const getTestBySubjectId = (subjectId: number) => {
    return tests.find(test => test.subjectId === subjectId && test.isActive);
  };
  
  const handleUploadClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsUploadModalOpen(true);
  };
  
  const handleDeleteClick = (test: Test) => {
    setTestToDelete(test);
    setIsDeleteConfirmOpen(true);
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading subjects...</div>;
  }
  
  if (error) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex items-center text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {aircraftName} - {testType === 'mock' ? 'Mock Tests' : 'Practice Tests'}
        </h2>
        
        <Button onClick={() => setIsAddSubjectOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>
      
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Subjects Available</h3>
            <p className="text-muted-foreground mb-4">
              Add a subject to start creating tests for {aircraftName}.
            </p>
            <Button onClick={() => setIsAddSubjectOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>
              Manage {testType === 'mock' ? 'mock' : 'practice'} tests for each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => {
                  const test = getTestBySubjectId(subject.id);
                  return (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        {test ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{test ? test.totalQuestions : '-'}</TableCell>
                      <TableCell>
                        {test ? (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDistanceToNow(new Date(test.lastUpdated), { addSuffix: true })}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {test ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUploadClick(subject)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Replace
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteClick(test)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUploadClick(subject)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Add Subject Dialog */}
      <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Enter a name for the new subject for {aircraftName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input 
                id="subjectName" 
                value={newSubjectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSubjectName(e.target.value)}
                placeholder="e.g., Systems, Procedures, Navigation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddSubjectOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSubject}>Add Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Upload Modal */}
      {selectedSubject && (
        <TestUploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedSubject(null);
          }}
          subject={selectedSubject}
          aircraftId={aircraftId}
          testType={testType}
          isReplacement={!!getTestBySubjectId(selectedSubject.id)}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTest}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}