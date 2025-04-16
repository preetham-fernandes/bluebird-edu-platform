"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, Download, FileText, AlertTriangle, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onError: (error: string | null) => void;
}

export default function FileUploader({
  selectedFile,
  onFileSelect,
  onError
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

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
    const errors: string[] = [];
    setFileValidationErrors([]);
    onError(null);

    // Check file type
    const validTypes = ['.csv', '.xlsx', '.xls', '.txt'];
    const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileType)) {
      errors.push(`Invalid file type. Please upload CSV, Excel, or TXT files.`);
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(`File size exceeds 10MB limit.`);
    }

    if (errors.length > 0) {
      setFileValidationErrors(errors);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const downloadTemplate = () => {
    // In a real implementation, this would trigger a download of a template file
    console.log('Downloading template');
    // window.open('/api/admin/templates/questions-template.csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Upload Questions File</h2>
        <p className="text-sm text-muted-foreground">
          Upload a CSV, Excel, or TXT file containing your questions and answers
        </p>
      </div>

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${fileValidationErrors.length > 0 ? 'border-destructive bg-destructive/5' : ''}
          transition-colors duration-200 cursor-pointer
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
          accept=".csv,.xlsx,.xls,.txt"
          onChange={handleChange}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">{selectedFile.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Change File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">
              Drag and drop your file or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload CSV, Excel, or TXT file with questions (max 10MB)
            </p>
            <Button variant="secondary" size="sm">
              Select File
            </Button>
          </div>
        )}
      </div>

      {fileValidationErrors.length > 0 && (
        <div className="flex flex-col">
          {fileValidationErrors.map((error, index) => (
            <div key={index} className="flex items-center text-destructive mb-1 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">File Format Requirements</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Your file should contain the following columns in this order:</p>
          <ol className="list-decimal list-inside space-y-1 ml-1">
            <li>Question Number (numeric)</li>
            <li>Question Text (text)</li>
            <li>Option A (text)</li>
            <li>Option B (text)</li>
            <li>Option C (text)</li>
            <li>Option D (text)</li>
            <li>Correct Answer (A, B, C, or D)</li>
            <li>Explanation (optional text)</li>
          </ol>
          <p className="mt-2">Example row:</p>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
            1,"What is the maximum cruise altitude?","35,000 ft","38,000 ft","41,000 ft","44,000 ft",C,"The maximum certified altitude is 41,000 ft."
          </pre>
        </div>
      </div>
    </div>
  );
}