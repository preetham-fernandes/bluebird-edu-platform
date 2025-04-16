"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Pen } from "lucide-react";

interface TestType {
  id: number;
  type: string;
}

interface TestTypeSelectorProps {
  selectedTestType: { id: number; type: string } | null;
  onSelectTestType: (testType: { id: number; type: string } | null) => void;
  onError: (error: string | null) => void;
}

export default function TestTypeSelector({
  selectedTestType,
  onSelectTestType,
  onError
}: TestTypeSelectorProps) {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        setLoading(true);
        onError(null);
        
        const response = await fetch('/api/admin/test-types');
        
        if (!response.ok) {
          throw new Error('Failed to fetch test types');
        }
        
        const data = await response.json();
        setTestTypes(data);
      } catch (err) {
        console.error('Error fetching test types:', err);
        onError(err instanceof Error ? err.message : 'Failed to load test types');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestTypes();
  }, [onError]);

  const handleSelectTestType = (id: number, type: string) => {
    onSelectTestType({ id, type });
  };

  // Helper function to get the appropriate icon based on test type
  const getTestTypeIcon = (type: string) => {
    if (type.toLowerCase() === 'mock') {
      return <Pen className="h-5 w-5" />;
    }
    return <BookOpen className="h-5 w-5" />;
  };

  // Helper function to get a user-friendly display name
  const getDisplayName = (type: string) => {
    if (type.toLowerCase() === 'mock') {
      return 'Mock Test';
    }
    if (type.toLowerCase() === 'practice') {
      return 'Practice Test';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to get a description
  const getDescription = (type: string) => {
    if (type.toLowerCase() === 'mock') {
      return 'Timed tests simulating exam conditions';
    }
    if (type.toLowerCase() === 'practice') {
      return 'Practice tests with immediate feedback';
    }
    return 'Test type';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Select Test Type</h2>
        <p className="text-sm text-muted-foreground">
          Choose the type of test for which you're uploading questions
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : testTypes.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Test Types Available</h3>
            <p className="text-muted-foreground">
              There are no test types in the system. Please contact the system administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedTestType ? selectedTestType.id.toString() : ''}
          onValueChange={(value) => {
            const selected = testTypes.find(t => t.id.toString() === value);
            if (selected) {
              handleSelectTestType(selected.id, selected.type);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {testTypes.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedTestType?.id === item.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectTestType(item.id, item.type)}
            >
              <RadioGroupItem
                value={item.id.toString()}
                id={`test-type-${item.id}`}
                className="sr-only"
              />
              <Label
                htmlFor={`test-type-${item.id}`}
                className="flex items-start gap-3 cursor-pointer"
              >
                <div className={`mt-0.5 ${
                  selectedTestType?.id === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}>
                  {getTestTypeIcon(item.type)}
                </div>
                <div>
                  <div className="font-medium">{getDisplayName(item.type)}</div>
                  <div className="text-sm text-muted-foreground">
                    {getDescription(item.type)}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}