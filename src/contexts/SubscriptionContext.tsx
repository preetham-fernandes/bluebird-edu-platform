// src/contexts/SubscriptionContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

interface SubscribedModule {
  type: string;
  id: number;
}

interface SubscriptionData {
  id: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
  plan: {
    name: string;
    displayName: string;
    moduleType: string;
    moduleId: number;
  };
}

interface Subscription {
  id: number;
  status: string;
  endDate: string;
  plan: {
    moduleType: string;
    moduleId: number;
  };
}

interface SubscriptionContextType {
  hasActiveSubscription: boolean;
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  error: Error | null;
  refreshSubscription: () => Promise<void>;
  checkModuleAccess: (moduleType: string, moduleId: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  hasActiveSubscription: false,
  subscriptionData: null,
  loading: true,
  error: null,
  refreshSubscription: async () => {},
  checkModuleAccess: () => false,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionData, _setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [error, _setError] = useState<Error | null>(null);
  const [subscribedModules, setSubscribedModules] = useState<SubscribedModule[]>([]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/subscriptions');
      
      if (!response.ok) {
        // If not authenticated or error, set to no subscriptions
        setHasActiveSubscription(false);
        setSubscribedModules([]);
        return;
      }
      
      const subscriptions: Subscription[] = await response.json();
      
      // Filter to only active subscriptions
      const activeSubscriptions = subscriptions.filter(sub => 
        sub.status === 'active' && new Date(sub.endDate) > new Date()
      );
      
      // Extract modules from active subscriptions
      const modules = activeSubscriptions.map(sub => ({
        type: sub.plan.moduleType,
        id: sub.plan.moduleId
      }));
      
      setHasActiveSubscription(activeSubscriptions.length > 0);
      setSubscribedModules(modules);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // If error, set to no subscriptions
      setHasActiveSubscription(false);
      setSubscribedModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const _checkModuleAccess = useCallback((moduleType: string, moduleId: number) => {
    return subscribedModules.some(
      module => module.type === moduleType && module.id === moduleId
    );
  }, [subscribedModules]);

  return (
    <SubscriptionContext.Provider
      value={{
        loading,
        hasActiveSubscription,
        subscriptionData,
        error,
        refreshSubscription: fetchSubscriptionStatus,
        checkModuleAccess: _checkModuleAccess
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);

/**
 * Server-side helper to check subscription status
 */
export async function checkUserSubscriptionServer(userId: number): Promise<boolean> {
  try {
    const prisma = (await import('@/lib/db/prisma')).default;
    
    // Get current date
    const now = new Date();
    
    // Check if user has any active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: {
          gt: now
        }
      }
    });
    
    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}