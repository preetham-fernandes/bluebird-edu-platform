// src/app/obm-admin/dashboard/page.tsx
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
  } from "@/components/ui/card";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { Button } from "@/components/ui/button";
  import { Progress } from "@/components/ui/progress";
  import { 
    ArrowRight, 
    Book, 
    CheckCircle, 
    ClipboardList,
    FileText, 
    Timer, 
    TrendingUp,
    MessageSquare
  } from "lucide-react";
  import Link from "next/link";
  
  export default function DashboardPage() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
      </div>
    );
  }