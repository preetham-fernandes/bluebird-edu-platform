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
import { AlertCircle, BookOpen, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

interface Subject {
  id: number;
  name: string;
  testCount: number;
}

export default function PracticeTestSubjectsPage() {
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
        
        // Fetch subjects from the API
        const response = await fetch(`/api/titles?aircraft=${formatParam(aircraft)}&testType=practice`);
        
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
    router.push(`/dashboard`);
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
            {formattedAircraft} Practice Tests
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Select a subject to view available practice tests
        </p>
      </div>
      
      {subjects.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Practice Tests Available</AlertTitle>
          <AlertDescription>
            There are no practice tests available for {formattedAircraft} at this time.
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
                    ? "1 practice test available"
                    : `${subject.testCount} practice tests available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {subject.testCount > 0
                    ? `Practice tests for ${formattedAircraft} ${subject.name}`
                    : "No practice tests available for this subject yet."}
                </p>
              </CardContent>
              <CardFooter>
                {subject.testCount > 0 ? (
                  <Button 
                    className="w-full" 
                    asChild
                  >
                    <Link href={`/${formatParam(aircraft)}/practice-test/${formatSubjectForUrl(subject.name)}`}>
                      View Practice Tests
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