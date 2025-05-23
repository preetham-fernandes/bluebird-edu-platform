// src/components/SubscriptionGate.tsx
'use client';

import { ReactNode } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionGateProps {
  moduleType: string;
  moduleId: number;
  children: ReactNode;
  fallback?: ReactNode;
}

export function SubscriptionGate({ moduleType, moduleId, children, fallback }: SubscriptionGateProps) {
  const { loading, checkModuleAccess } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = checkModuleAccess(moduleType, moduleId);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-8 flex flex-col items-center text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Subscribe to Access This Content
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            This content requires a subscription. Subscribe now to get access to all tests and study materials.
          </p>
          <Button onClick={() => router.push('/subscriptions')}>
            View Subscription Options
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}