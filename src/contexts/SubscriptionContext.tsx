// src/contexts/SubscriptionContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SubscribedModule {
  type: string;
  id: number;
}

interface SubscriptionContextType {
  isLoading: boolean;
  hasActiveSubscription: boolean;
  subscribedModules: SubscribedModule[];
  checkModuleAccess: (moduleType: string, moduleId: number) => boolean;
  refreshSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isLoading: true,
  hasActiveSubscription: false,
  subscribedModules: [],
  checkModuleAccess: () => false,
  refreshSubscriptionStatus: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscribedModules, setSubscribedModules] = useState<SubscribedModule[]>([]);

  const fetchSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/subscriptions');
      
      if (!response.ok) {
        // If not authenticated or error, set to no subscriptions
        setHasActiveSubscription(false);
        setSubscribedModules([]);
        return;
      }
      
      const subscriptions = await response.json();
      
      // Filter to only active subscriptions
      const activeSubscriptions = subscriptions.filter((sub: any) => 
        sub.status === 'active' && new Date(sub.endDate) > new Date()
      );
      
      // Extract modules from active subscriptions
      const modules = activeSubscriptions.map((sub: any) => ({
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const checkModuleAccess = (moduleType: string, moduleId: number) => {
    return subscribedModules.some(
      module => module.type === moduleType && module.id === moduleId
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isLoading,
        hasActiveSubscription,
        subscribedModules,
        checkModuleAccess,
        refreshSubscriptionStatus: fetchSubscriptionStatus,
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