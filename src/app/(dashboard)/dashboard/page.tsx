// src/app/(dashboard)/dashboard/page.tsx
"use client"
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
  import { 
    Book, 
    CheckCircle, 
    ClipboardList,
    TrendingUp, AlertCircle
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
    const { hasActiveSubscription, isLoading } = useSubscription();

    return (
      <div className="space-y-6">
        <div className="max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to Bluebird</h1>
          <p className="text-muted-foreground mt-2">
            Strap in, run your checklist, and see what you're flying into.
          </p>
        </div>

        {!isLoading && !hasActiveSubscription && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You currently have access to demo tests only. Subscribe to unlock all content.
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/subscriptions">View subscription options</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
            href="/boeing-737-max/test-type"
          />
          <DashboardCategoryCard
            title="Airbus"
            description="Airbus aircraft systems and procedures"
            details="In-depth coverage of Airbus aircraft operations and systems."
            icon={<CheckCircle />}
            href="/airbus-a320/test-type"
          />
        </div>
      </div>
    );
  }