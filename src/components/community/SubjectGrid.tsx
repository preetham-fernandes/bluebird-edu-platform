// src/components/community/SubjectGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { MessageSquare } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  threadCount: number;
}

interface SubjectGridProps {
  moduleId: string;
}

export default function SubjectGrid({ moduleId }: SubjectGridProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!moduleId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/community/modules/${moduleId}/subjects`);
        
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [moduleId]);

  const handleSubjectSelect = (subjectId: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("subjectId", subjectId.toString());
    router.push(`/community?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardContent>
          <p>No subjects found for this module.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card 
          key={subject.id} 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleSubjectSelect(subject.id)}
        >
          <CardHeader>
            <CardTitle>{subject.name}</CardTitle>
            <CardDescription>
              {subject.threadCount} discussion{subject.threadCount !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Join the conversation about {subject.name}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              View Discussions
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}