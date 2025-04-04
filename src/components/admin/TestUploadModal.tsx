// src/components/admin/TestUploadModal.tsx
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FileUploadField from './FileUploadField';
import { Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadError {
  row: number;
  column: string;
  message: string;
}

interface TestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: {
    id: number;
    name: string;
  };
  aircraftId: number;
  testType: 'mock' | 'practice';
  isReplacement?: boolean;
}

export default function TestUploadModal({
  isOpen,
  onClose,
  subject,
  aircraftId,
  testType,
  isReplacement = false
}: TestUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<UploadError[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    setValidationErrors([]);
    setUploadSuccess(false);
  };
  
  const downloadTemplate = () => {
    // In a real implementation, this would trigger a download from the server
    // For now, we'll just log it
    console.log('Downloading template');
    // window.open('/api/admin/templates/test-upload', '_blank');
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setValidationErrors([]);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('aircraftId', aircraftId.toString());
      formData.append('subjectId', subject.id.toString());
      formData.append('testType', testType);
      
      const response = await fetch('/api/admin/tests/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setValidationErrors(data.errors);
        } else {
          setUploadError(data.message || 'Failed to upload test');
        }
      } else {
        setUploadSuccess(true);
        // Reset after successful upload
        setSelectedFile(null);
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setUploadError('An unexpected error occurred');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isReplacement ? 'Replace Test' : 'Upload New Test'} - {subject.name}
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file containing questions for {testType === 'mock' ? 'mock test' : 'practice test'}.
            {isReplacement && ' This will replace the existing test.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <FileUploadField
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            error={uploadError}
            success={uploadSuccess ? 'File uploaded successfully!' : undefined}
          />
          
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {testType === 'mock' ? 'Mock' : 'Practice'} Test for {subject.name}
            </div>
          </div>
          
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">File validation errors:</h4>
                  <ul className="mt-1 max-h-40 overflow-y-auto text-xs space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="font-medium">Row {error.row}, {error.column}:</span>
                        <span>{error.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading || uploadSuccess}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}