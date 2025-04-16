"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plane, 
  BookOpen, 
  Upload,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AircraftSelector from "@/components/admin/bulk-upload/AircraftSelector";
import TestTypeSelector from "@/components/admin/bulk-upload/TestTypeSelector";
import SubjectSelector from "@/components/admin/bulk-upload/SubjectSelector";
import FileUploader from "@/components/admin/bulk-upload/FileUploader";
import UploadSummary from "@/components/admin/bulk-upload/UploadSummary";

const steps = [
  { id: 'aircraft', title: 'Select Aircraft', icon: <Plane className="h-5 w-5" /> },
  { id: 'test-type', title: 'Select Test Type', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'subject', title: 'Select Subject', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'upload', title: 'Upload Questions', icon: <Upload className="h-5 w-5" /> },
  { id: 'summary', title: 'Summary', icon: <CheckCircle className="h-5 w-5" /> },
];

export default function BulkUploadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [selectedAircraft, setSelectedAircraft] = useState<{id: number, name: string} | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<{id: number, type: string} | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{id: number, name: string} | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSummary, setUploadSummary] = useState<{
    questionsUploaded: number;
    errorsEncountered: number;
    subjectName: string;
    aircraftName: string;
    testTypeName: string;
  } | null>(null);

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0: // Aircraft selection
        return !selectedAircraft;
      case 1: // Test type selection
        return !selectedTestType;
      case 2: // Subject selection
        return !selectedSubject;
      case 3: // File upload
        return !uploadedFile;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !selectedAircraft || !selectedTestType || !selectedSubject) {
      setError('Please complete all fields before uploading');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('aircraftId', selectedAircraft.id.toString());
      formData.append('testTypeId', selectedTestType.id.toString());
      formData.append('subjectId', selectedSubject.id.toString());

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload questions');
      }

      const data = await response.json();
      
      // Set success summary
      setUploadSummary({
        questionsUploaded: data.questionsUploaded || 0,
        errorsEncountered: data.errorsEncountered || 0,
        subjectName: selectedSubject.name,
        aircraftName: selectedAircraft.name,
        testTypeName: selectedTestType.type,
      });
      
      setSuccess(true);
      // Move to summary step
      setCurrentStep(4);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedAircraft(null);
    setSelectedTestType(null);
    setSelectedSubject(null);
    setUploadedFile(null);
    setCurrentStep(0);
    setSuccess(false);
    setError(null);
    setUploadSummary(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Upload Questions</h1>
          <p className="text-muted-foreground mt-1">
            Upload multiple questions at once to create or update tests
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Upload Wizard</CardTitle>
          <CardDescription>
            Follow the steps to upload questions in bulk
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex-1 relative ${
                    index === steps.length - 1 ? '' : 'after:content-[""] after:absolute after:w-full after:h-0.5 after:bg-muted after:top-5 after:left-1/2'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className={`rounded-full w-10 h-10 flex items-center justify-center z-10 relative ${
                        index < currentStep 
                          ? 'bg-primary text-primary-foreground' 
                          : index === currentStep 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      index === currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <div className="py-4">
            {currentStep === 0 && (
              <AircraftSelector 
                selectedAircraft={selectedAircraft} 
                onSelectAircraft={setSelectedAircraft}
                onError={setError}
              />
            )}

            {currentStep === 1 && (
              <TestTypeSelector 
                selectedTestType={selectedTestType}
                onSelectTestType={setSelectedTestType}
                onError={setError}
              />
            )}

            {currentStep === 2 && selectedAircraft && selectedTestType && (
              <SubjectSelector 
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                aircraftId={selectedAircraft.id}
                testTypeId={selectedTestType.id}
                onError={setError}
              />
            )}

            {currentStep === 3 && (
              <FileUploader
                onFileSelect={setUploadedFile}
                selectedFile={uploadedFile}
                onError={setError}
              />
            )}

            {currentStep === 4 && uploadSummary && (
              <UploadSummary
                summary={uploadSummary}
                onReset={handleReset}
              />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || currentStep === 4}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button 
              onClick={handleNext} 
              disabled={isNextDisabled()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : currentStep === 3 ? (
            <Button 
              onClick={handleUpload} 
              disabled={isNextDisabled() || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          ) : (
            <Button 
              onClick={handleReset}
              variant="outline"
            >
              Start New Upload
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}