"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Play, ArrowLeft, Timer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Test {
  id: number;
  title: string;
  subject: string;
  totalQuestions: number;
  timeLimit: number | null;
}

export default function MockTestListPage() {
  const router = useRouter();
  const params = useParams();
  const { aircraft, title } = params;
  
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to format URL parameters
  const formatParam = (param: string | string[]) => 
    Array.isArray(param) ? param[0] : param;
  
  // Format the aircraft and title for display
  const formattedAircraft = formatParam(aircraft)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const formattedTitle = formatParam(title)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        
        // Fetch tests for this title from API
        const response = await fetch(`/api/tests?aircraft=${formatParam(aircraft)}&title=${formatParam(title)}&testType=mock`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tests');
        }
        
        const data = await response.json();
        setTests(data);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTests();
  }, [aircraft, title]);
  
  const startTest = (testId: number) => {
    router.push(`/${formatParam(aircraft)}/mock-test/${formatParam(title)}/${testId}`);
  };
  
  const goBack = () => {
    router.push(`/${formatParam(aircraft)}/mock-test`);
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-72" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {formattedTitle} Mock Tests
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Full-length timed mock exams for {formattedAircraft} - {formattedTitle}
        </p>
      </div>
      
      {tests.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Tests Available</AlertTitle>
          <AlertDescription>
            There are no mock tests available for {formattedAircraft} - {formattedTitle} at this time.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="border-blue-200 dark:border-blue-800 border-2">
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
                <CardDescription>
                  {formattedAircraft} - {test.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><strong>Questions:</strong> {test.totalQuestions}</p>
                  <p className="flex items-center text-amber-600 dark:text-amber-400">
                    <Timer className="h-4 w-4 mr-1 inline" />
                    <strong>Time Limit:</strong> {test.timeLimit ? `${test.timeLimit} minutes` : 'No time limit'}
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                    This is a timed exam simulation. Once started, you must complete the entire test before seeing your results.
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => startTest(test.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Mock Exam
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}