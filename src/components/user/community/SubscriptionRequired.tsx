// src/components/user/community/SubscriptionRequired.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

interface SubscriptionRequiredProps {
  type: "thread" | "reply";
}

export default function SubscriptionRequired({ type }: SubscriptionRequiredProps) {
  return (
    <Card className="border-dashed w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Subscription Required
        </CardTitle>
        <CardDescription>
          {type === "thread" 
            ? "Creating new threads requires an active subscription" 
            : "Replying to messages requires an active subscription"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Subscribe to access all community features including:
        </p>
        <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
          <li>Creating new discussion threads</li>
          <li>Replying to threads and messages</li>
          <li>Accessing premium study questionaires</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/subscriptions">View Subscription Plans</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}