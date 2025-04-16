// src/app/(dashboard)/dashboard/page.tsx
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    CardFooter
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
  import { ReactNode } from "react";
  
  function DashboardCategoryCard({
    title,
    description,
    details,
    icon: Icon,
    href,
  }: {
    title: string;
    description: string;
    details: string;
    icon: ReactNode;
    href: string;
  }) {
    return (
      <Link
        href={href}
        className={
          `block group rounded-xl border bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 transition-transform duration-200 hover:scale-105 focus:scale-105 outline-none shadow-lg hover:shadow-2xl focus:ring-2 focus:ring-blue-200/40 min-h-[220px] flex flex-col justify-between w-full`
        }
        tabIndex={0}
      >
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl text-gray-700 dark:text-white/80">{Icon}</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white/90">{title}</span>
        </div>
        <div className="text-base font-medium mb-1 text-gray-800 dark:text-white/80">{description}</div>
        <div className="text-sm text-gray-700 dark:text-white/70">{details}</div>
      </Link>
    );
  }

  export default function DashboardPage() {
    return (
      <div className="space-y-6">
        <div className="max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to Bluebird</h1>
          <p className="text-muted-foreground mt-2">
            Strap in, run your checklist, and see what you're flying into. <br/>
            Bluebird is here to help you stay ahead of the curve and stay in trim for the real deal.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <DashboardCategoryCard
            title="Meteorology"
            description="Weather patterns, atmospheric conditions, and flight planning"
            details="Master the essentials of aviation weather and meteorological concepts."
            icon={<Book />}
            href="/meteorology/practice-test"
          />
          <DashboardCategoryCard
            title="Air Regulations"
            description="Aviation laws, procedures, and regulatory requirements"
            details="Stay current with aviation regulations and compliance requirements."
            icon={<ClipboardList />}
            href="/air-regulations/practice-test"
          />
          <DashboardCategoryCard
            title="Boeing"
            description="Boeing aircraft systems and procedures"
            details="Comprehensive training for Boeing aircraft types and variants."
            icon={<TrendingUp />}
            href="/boeing-737-max/practice-test"
          />
          <DashboardCategoryCard
            title="Airbus"
            description="Airbus aircraft systems and procedures"
            details="In-depth coverage of Airbus aircraft operations and systems."
            icon={<CheckCircle />}
            href="/airbus/practice-test"
          />
        </div>
      </div>
    );
  }