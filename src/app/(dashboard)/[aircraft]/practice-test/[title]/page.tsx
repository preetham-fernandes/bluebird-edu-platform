//src/app/(dashboard)/[aircraft]/practice-test/[title]/page.tsx
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
import { AlertCircle, Play, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Test {
  id: number;
  title: string;
  subject: string;
  totalQuestions: number;
  timeLimit: number | null;
}

export default function PracticeTestListPage() {
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
          console.log('Fetching tests for:', formatParam(aircraft), formatParam(title));
          
          // Use your existing tests endpoint
          const testsResponse = await fetch(
            `/api/tests?aircraft=${formatParam(aircraft)}&title=${formatParam(title)}&testType=practice`
          );
          
          if (!testsResponse.ok) {
            throw new Error('Failed to fetch tests');
          }
          
          const testsData = await testsResponse.json();
          console.log('Tests data:', testsData);
          
          // Set tests directly, as the response is already properly formatted
          setTests(testsData);
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
    router.push(`/${formatParam(aircraft)}/practice-test/${formatParam(title)}/${testId}`);
  };
  
  const goBack = () => {
    router.push(`/${formatParam(aircraft)}/practice-test`);
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
            {formattedTitle} Tests
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Practice tests for {formattedAircraft} - {formattedTitle}
        </p>
      </div>
      
      {tests.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Tests Available</AlertTitle>
          <AlertDescription>
            There are no practice tests available for {formattedAircraft} - {formattedTitle} at this time.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
                <CardDescription>
                  {formattedAircraft} - {test.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p><strong>Questions:</strong> {test.totalQuestions}</p>
                  <p><strong>Time Limit:</strong> {test.timeLimit ? `${test.timeLimit} minutes` : 'No time limit'}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => startTest(test.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}