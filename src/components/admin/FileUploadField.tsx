// src/components/admin/FileUploadField.tsx
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, AlertTriangle, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FileUploadFieldProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  isUploading?: boolean;
  error?: string;
  success?: string;
}

export default function FileUploadField({
  onFileSelect,
  accept = ".xlsx,.csv",
  maxSize = 10, // 10MB default
  isUploading = false,
  error,
  success
}: FileUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!fileType || !accept.includes(`.${fileType}`)) {
      setFileError(`Invalid file type. Please upload ${accept} files.`);
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSize}MB limit.`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${error ? 'border-destructive bg-destructive/5' : ''}
          ${success ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Uploading file...</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
        ) : selectedFile && !error && !fileError ? (
          <div className="flex items-center">
            <File className="h-8 w-8 text-primary mr-2" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className={`h-12 w-12 mb-2 ${error || fileError ? 'text-destructive' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium mb-1">
              {error || fileError ? 'Error uploading file' : 'Drag and drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {error || fileError ? (error || fileError) : `${accept.split(',').join(', ')} files up to ${maxSize}MB`}
            </p>
          </>
        )}
        
        {!isUploading && (
          <Button 
            type="button" 
            variant={selectedFile ? "outline" : "secondary"} 
            size="sm"
            className="mt-2"
          >
            {selectedFile ? "Change File" : "Select File"}
          </Button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center mt-2 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center mt-2 text-green-600 dark:text-green-400 text-sm">
          <Check className="h-4 w-4 mr-1" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}