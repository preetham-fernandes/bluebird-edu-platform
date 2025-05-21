// src/components/user/community/SubscriptionBanner.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreditCard, Info } from "lucide-react";
import Link from "next/link";

export default function SubscriptionBanner() {
  return (
    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-800 dark:text-blue-300">
        Subscription required for full participation
      </AlertTitle>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          While browsing is available to all users, creating threads and replying requires an active subscription.
        </AlertDescription>
        <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
          <Link href="/subscriptions">
            <CreditCard className="mr-2 h-4 w-4" />
            View Plans
          </Link>
        </Button>
      </div>
    </Alert>
  );
}