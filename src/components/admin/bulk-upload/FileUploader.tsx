"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertTriangle, Download } from 'lucide-react';

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
  const [isDownloading, setIsDownloading] = useState(false);

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

    // Check file type - only accept .txt files
    const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (fileType !== '.txt') {
      errors.push(`Invalid file type. Please upload a TXT file.`);
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

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);
      onError(null);
      
      // Fetch the template from the API - only txt now
      const response = await fetch(`/api/admin/templates/txt`);
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create an object URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-template.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      onError('Failed to download template. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Upload Questions File</h2>
        <p className="text-sm text-muted-foreground">
          Upload a TXT file containing your questions in comma-separated values format
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
          accept=".txt"
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
              Upload TXT file with comma-separated question data (max 10MB)
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
            disabled={isDownloading}
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download Template'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Your text file should contain comma-separated values with the following columns in this order:</p>
          <ol className="list-decimal list-inside space-y-1 ml-1">
            <li>Question Number (numeric)</li>
            <li>Question Text (text)</li>
            <li>Option A (text)</li>
            <li>Option B (text)</li>
            <li>Option C (text) - <span className="italic">leave empty for True/False questions</span></li>
            <li>Option D (text) - <span className="italic">leave empty for True/False questions</span></li>
            <li>Correct Answer (A, B, C, or D)</li>
            <li>Explanation (optional text) - <span className="italic">can be omitted</span></li>
          </ol>
          <p className="mt-2">Example formats:</p>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto mb-2">
            <span className="font-semibold">Standard Question (with explanation):</span>
            1,&quot;What is the maximum operating altitude?&quot;,&quot;40,000 ft&quot;,&quot;41,000 ft&quot;,&quot;43,000 ft&quot;,&quot;39,000 ft&quot;,B,&quot;The maximum operating altitude is 41,000 feet.&quot;
          </pre>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto mb-2">
            <span className="font-semibold">Standard Question (without explanation):</span>
            2,&quot;With flaps 40 selected, what is the speedbrake restriction?&quot;,&quot;Speedbrake can be used fully&quot;,&quot;Must not go beyond ARMED detent&quot;,&quot;May be used at pilot's discretion&quot;,&quot;Use only during descent&quot;,B
          </pre>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto mb-2">
            <span className="font-semibold">True/False Question (with explanation):</span>
            3,&quot;Intentional selection of reverse thrust in flight is prohibited.&quot;,&quot;True&quot;,&quot;False&quot;,&quot;&quot;,&quot;&quot;,A,&quot;Selecting reverse thrust in flight is strictly prohibited.&quot;
          </pre>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
            <span className="font-semibold">True/False Question (without explanation):</span>
            4,&quot;The minimum fuel tank temperature prior to takeoff is –43°C.&quot;,&quot;True&quot;,&quot;False&quot;,&quot;&quot;,&quot;&quot;,A
          </pre>
        </div>
      </div>
    </div>
  );
}