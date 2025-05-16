// src/app/(dashboard)/community/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ModuleTabsNavigation from "@/components/community/ModuleTabsNavigation";
import SubjectGrid from "@/components/community/SubjectGrid";
import ThreadList from "@/components/community/ThreadList";
import ThreadView from "@/components/community/ThreadView";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const subjectId = searchParams.get("subjectId");
  const threadId = searchParams.get("threadId");
  
  const [moduleName, setModuleName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  
  // Fetch module and subject names for breadcrumbs
  useEffect(() => {
    const fetchModuleName = async () => {
      if (!moduleId) return;
      
      try {
        const response = await fetch(`/api/community/modules/${moduleId}`);
        
        if (response.ok) {
          const data = await response.json();
          setModuleName(data.name);
        }
      } catch (error) {
        console.error("Error fetching module name:", error);
      }
    };
    
    const fetchSubjectName = async () => {
      if (!subjectId) return;
      
      try {
        const response = await fetch(`/api/community/subjects/${subjectId}`);
        
        if (response.ok) {
          const data = await response.json();
          setSubjectName(data.name);
        }
      } catch (error) {
        console.error("Error fetching subject name:", error);
      }
    };
    
    fetchModuleName();
    
    if (subjectId) {
      fetchSubjectName();
    }
  }, [moduleId, subjectId]);
  
  // Determine the current view based on URL parameters
  const renderContent = () => {
    if (threadId && subjectId && moduleId) {
      return (
        <ThreadView 
          threadId={threadId} 
          onBack={() => {
            // Go back to thread list
            window.history.pushState(
              {},
              "",
              `/community?moduleId=${moduleId}&subjectId=${subjectId}`
            );
            window.dispatchEvent(new Event("popstate"));
          }}
        />
      );
    }
    
    if (subjectId && moduleId) {
      return (
        <ThreadList
          moduleId={moduleId}
          subjectId={subjectId}
          onBack={() => {
            // Go back to subject grid
            window.history.pushState(
              {},
              "",
              `/community?moduleId=${moduleId}`
            );
            window.dispatchEvent(new Event("popstate"));
          }}
        />
      );
    }
    
    if (moduleId) {
      return <SubjectGrid moduleId={moduleId} />;
    }
    
    return <div>Please select a module to view discussions.</div>;
  };
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Community</h1>
      
      {/* Breadcrumb navigation */}
      {moduleId && (
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/community">Community</BreadcrumbLink>
            </BreadcrumbItem>
            
            {moduleName && (
              <BreadcrumbItem>
                <BreadcrumbLink href={`/community?moduleId=${moduleId}`}>
                  {moduleName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            {subjectName && (
              <BreadcrumbItem>
                <BreadcrumbLink href={`/community?moduleId=${moduleId}&subjectId=${subjectId}`}>
                  {subjectName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            {threadId && (
              <BreadcrumbItem>
                <BreadcrumbLink>Thread</BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>
        </div>
      )}
      
      {/* Module selection tabs */}
      <ModuleTabsNavigation />
      
      {/* Main content based on selected view */}
      {renderContent()}
    </div>
  );
}