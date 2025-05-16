// src/app/obm-admin/community-management/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import ModuleManagement from "@/components/admin/community/ModuleManagement";
import SubjectManagement from "@/components/admin/community/SubjectManagement";
import ThreadManagement from "@/components/admin/community/ThreadManagement";
import ReportManagement from "@/components/admin/community/ReportManagement";
import { MessageSquare, AlertCircle, PlaneTakeoff, BookOpen } from "lucide-react";

export default function CommunityManagementPage() {
  const [activeTab, setActiveTab] = useState("modules");

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
        <p className="text-muted-foreground">
          Manage community modules, subjects, and moderate content
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-2/3">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <PlaneTakeoff className="h-4 w-4" />
            <span className="hidden sm:inline">Modules</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="threads" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Threads</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Management</CardTitle>
              <CardDescription>
                Manage aircraft modules that serve as top-level categories in community discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subject Management</CardTitle>
              <CardDescription>
                Manage subjects within modules for organizing discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threads">
          <Card>
            <CardHeader>
              <CardTitle>Thread Management</CardTitle>
              <CardDescription>
                Browse and moderate discussion threads across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThreadManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports Management</CardTitle>
              <CardDescription>
                Review and resolve reported content from the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}