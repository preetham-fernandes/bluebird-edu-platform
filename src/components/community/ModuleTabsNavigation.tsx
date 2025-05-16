// src/components/community/ModuleTabsNavigation.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Module {
  id: number;
  name: string;
  slug: string;
}

export default function ModuleTabsNavigation() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentModuleId = searchParams.get("moduleId");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/community/modules");
        
        if (response.ok) {
          const data = await response.json();
          setModules(data);
          
          // If no module is selected, select the first one by default
          if (!currentModuleId && data.length > 0) {
            handleModuleChange(data[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [currentModuleId]);

  const handleModuleChange = (moduleId: string) => {
    // Update URL with the selected module
    const params = new URLSearchParams(searchParams);
    params.set("moduleId", moduleId);
    params.delete("subjectId"); // Clear subject when changing module
    router.push(`/community?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Tabs 
        value={currentModuleId || (modules[0]?.id.toString() || "")}
        onValueChange={handleModuleChange}
      >
        <TabsList className="w-full">
          {modules.map((module) => (
            <TabsTrigger
              key={module.id}
              value={module.id.toString()}
              className="flex-1"
            >
              {module.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}