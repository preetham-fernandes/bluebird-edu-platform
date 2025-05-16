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
import { AlertCircle, BookOpen, ArrowLeft, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

interface Subject {
  id: number;
  name: string;
  testCount: number;
}

export default function MockTestSubjectsPage() {
  const router = useRouter();
  const params = useParams();
  const { aircraft } = params;
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to format URL parameters
  const formatParam = (param: string | string[]) => 
    Array.isArray(param) ? param[0] : param;
  
  // Format the aircraft for display
  const formattedAircraft = formatParam(aircraft)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Format subject name for URL
  const formatSubjectForUrl = (subject: string) => 
    subject.toLowerCase().replace(/\s+/g, '-');
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/titles?aircraft=${formatParam(aircraft)}&testType=mock`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, [aircraft]);
  
  const goBack = () => {
    router.push(`/${formatParam(aircraft)}/test-type`);
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
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
            {formattedAircraft} Mock Tests
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Select a subject to view available mock tests
        </p>
      </div>
      
      <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-700 dark:text-yellow-300">Mock Test Information</AlertTitle>
        <AlertDescription className="text-yellow-600 dark:text-yellow-400">
          Mock tests simulate actual exam conditions with timed sessions. You'll see your results only after completing the full test.
        </AlertDescription>
      </Alert>
      
      {subjects.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Mock Tests Available</AlertTitle>
          <AlertDescription>
            There are no mock tests available for {formattedAircraft} at this time.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className={subject.testCount === 0 ? "opacity-70" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  {subject.name}
                </CardTitle>
                <CardDescription>
                  {subject.testCount === 1
                    ? "1 mock test available"
                    : `${subject.testCount} mock tests available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {subject.testCount > 0
                    ? `Full-length mock exams for ${formattedAircraft} ${subject.name}`
                    : "No mock tests available for this subject yet."}
                </p>
              </CardContent>
              <CardFooter>
                {subject.testCount > 0 ? (
                  <Button 
                    className="w-full" 
                    asChild
                  >
                    <Link href={`/${formatParam(aircraft)}/mock-test/${formatSubjectForUrl(subject.name)}`}>
                      View Mock Tests
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
                    Coming Soon
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}