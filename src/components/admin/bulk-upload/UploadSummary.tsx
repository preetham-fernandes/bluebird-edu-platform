"use client";

import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, FileCheck, Home } from "lucide-react";
import Link from "next/link";

interface UploadSummaryProps {
  summary: {
    questionsUploaded: number;
    errorsEncountered: number;
    subjectName: string;
    aircraftName: string;
    testTypeName: string;
  };
  onReset: () => void;
}

export default function UploadSummary({
  summary,
  onReset
}: UploadSummaryProps) {
  const isFullSuccess = summary.errorsEncountered === 0;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-full p-4 bg-green-100 dark:bg-green-900/20 mb-4">
          <FileCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Upload Complete</h2>
        <p className="text-muted-foreground">
          Your questions have been uploaded to {summary.aircraftName} / {summary.testTypeName} / {summary.subjectName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questions Uploaded</p>
              <p className="text-2xl font-bold">{summary.questionsUploaded}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className={`p-3 rounded-full ${
              isFullSuccess 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-amber-100 dark:bg-amber-900/20'
            } mr-4`}>
              {isFullSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold">{summary.errorsEncountered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Upload Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Aircraft:</span>
            <span>{summary.aircraftName}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Test Type:</span>
            <span>{summary.testTypeName}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Subject:</span>
            <span>{summary.subjectName}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Questions Uploaded:</span>
            <span>{summary.questionsUploaded}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className={isFullSuccess ? 'text-green-600' : 'text-amber-600'}>
              {isFullSuccess ? 'Completed Successfully' : 'Completed with Warnings'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onReset} className="flex-1">
          Upload More Questions
        </Button>
        
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/obm-admin/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}