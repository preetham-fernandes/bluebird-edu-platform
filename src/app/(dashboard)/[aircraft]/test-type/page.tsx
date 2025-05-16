"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Timer, CheckCircle, Pen, ArrowLeft } from "lucide-react";

export default function TestTypeSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const { aircraft } = params;
  
  // Function to format URL parameters
  const formatParam = (param: string | string[]) => 
    Array.isArray(param) ? param[0] : param;
  
  // Format the aircraft for display
  const formattedAircraft = formatParam(aircraft)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const navigateToTestType = (testType: 'mock-test' | 'practice-test') => {
    router.push(`/${formatParam(aircraft)}/${testType}`);
  };
  
  const goBack = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {formattedAircraft} Test Types
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 mb-6">
          Choose the type of test you would like to take
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mock Test Card */}
        <Card className="border-2 flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>Mock Test</CardTitle>
            </div>
            <CardDescription>
              Full-length exam simulation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-4">
              <p className="text-sm">
                Simulates the exam environment with timed sessions and comprehensive evaluation.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>Timed environment with countdown timer</p>
                </div>
                <div className="flex items-start gap-2">
                  <Pen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>One question displayed at a time</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>Results only shown after completing the entire test</p>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>Detailed explanations available in result review</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button 
              className="w-full" 
              onClick={() => navigateToTestType('mock-test')} 
              variant="default"
            >
              Take Mock Test
            </Button>
          </CardFooter>
        </Card>
        
        {/* Practice Test Card */}
        <Card className="border-2 flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle>Practice Test</CardTitle>
            </div>
            <CardDescription>
              Learning-focused practice
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-4">
              <p className="text-sm">
                Ideal for learning and building confidence with immediate feedback and explanations.
              </p>
              <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>No time limit - take as long as you need</p>
                </div>
                <div className="flex items-start gap-2">
                  <Pen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>Detailed explanations visible while practicing</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>Immediate feedback after answering each question</p>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>Multiple questions displayed per page</p>
                </div>                
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button 
              className="w-full" 
              onClick={() => navigateToTestType('practice-test')} 
              variant="default"
            >
              Take Practice Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}