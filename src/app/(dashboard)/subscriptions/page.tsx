// src/app/(dashboard)/subscriptions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, Loader2, AlertCircle } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  moduleType: string;
  moduleId: number;
  priceMonthly: number;
  priceYearly: number;
  features: string[] | null;
}

interface UserSubscription {
  id: number;
  planId: number;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: string;
}

export default function SubscriptionsPage() {
  const { data: _session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [subscriptionDuration, setSubscriptionDuration] = useState<'monthly' | 'yearly'>('monthly');
  
  useEffect(() => {
    // Redirect if not authenticated
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);
  
  // Fetch subscription plans and user subscriptions
  useEffect(() => {
    const fetchData = async () => {
      if (sessionStatus !== 'authenticated') return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch available subscription plans
        const plansResponse = await fetch('/api/user/subscription-plans');
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        const plansData = await plansResponse.json();
        setPlans(plansData);
        
        // Fetch user's existing subscriptions
        const subscriptionsResponse = await fetch('/api/user/subscriptions');
        if (!subscriptionsResponse.ok) {
          throw new Error('Failed to fetch your subscriptions');
        }
        const subscriptionsData = await subscriptionsResponse.json();
        setUserSubscriptions(subscriptionsData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sessionStatus]);
  
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setSubscribing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          duration: subscriptionDuration
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create subscription');
      }
      
      const subscription = await response.json();
      
      // Update the UI with the new subscription
      setUserSubscriptions(prev => [...prev, subscription]);
      
      // Close dialog
      setSubscribeDialogOpen(false);
      
      // Show success toast
      toast({
        title: "Subscription Successful",
        description: `You have successfully subscribed to ${selectedPlan.displayName}`,
      });
      
      // Reset selected plan
      setSelectedPlan(null);
      
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to create subscription');
    } finally {
      setSubscribing(false);
    }
  };
  
  // Check if user already has an active subscription for a plan
  const isAlreadySubscribed = (planId: number) => {
    return userSubscriptions.some(sub => 
      sub.planId === planId && 
      sub.status === 'active' && 
      new Date(sub.endDate) > new Date()
    );
  };
  
  // Filter plans based on active tab
  const filteredPlans = plans.filter(plan => {
    if (activeTab === 'all') return true;
    return plan.moduleType === activeTab;
  });
  
  // Format price with Indian Rupee symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose a subscription plan to access premium content and enhance your learning experience.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {userSubscriptions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Subscriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userSubscriptions.map(subscription => {
                const isActive = 
                  subscription.status === 'active' && 
                  new Date(subscription.endDate) > new Date();
                  
                return (
                  <Card key={subscription.id} className={!isActive ? "opacity-70" : undefined}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{subscription.plan ? subscription.plan.displayName : 'No Plan'}</CardTitle>
                        {isActive ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        {subscription.plan ? (subscription.plan.moduleType === 'aircraft' ? 'Aircraft' : 'Subject') : 'No Plan'} Plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Start Date:</span>
                        <span className="text-sm ml-2">
                          {new Date(subscription.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">End Date:</span>
                        <span className="text-sm ml-2">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isActive ? (
                        <Button variant="outline" className="w-full" disabled>
                          Active Subscription
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setSelectedPlan(subscription.plan);
                            setSubscribeDialogOpen(true);
                          }}
                        >
                          Renew Subscription
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Plans</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="aircraft">Aircraft</TabsTrigger>
                <TabsTrigger value="subject">Subjects</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No subscription plans available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle>{plan.displayName}</CardTitle>
                    <CardDescription>
                      {plan.moduleType === 'aircraft' ? 'Aircraft' : 'Subject'} Plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-bold">{formatPrice(plan.priceMonthly)}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(plan.priceYearly)} billed yearly
                      </div>
                      
                      {plan.description && (
                        <p className="text-sm">{plan.description}</p>
                      )}
                      
                      {plan.features && (
                        <ul className="space-y-1">
                          {(plan.features as string[]).map((feature, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <CheckIcon className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    {isAlreadySubscribed(plan.id) ? (
                      <Button variant="outline" className="w-full" disabled>
                        Already Subscribed
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setSubscribeDialogOpen(true);
                        }}
                      >
                        Subscribe
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Subscribe Dialog */}
      <Dialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.displayName}</DialogTitle>
            <DialogDescription>
              Choose your subscription duration. You can cancel anytime.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <div className="flex space-x-4">
              <Card 
                className={`flex-1 cursor-pointer ${subscriptionDuration === 'monthly' ? 'border-primary' : ''}`}
                onClick={() => setSubscriptionDuration('monthly')}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-center">{formatPrice(selectedPlan?.priceMonthly || 0)}</CardTitle>
                  <CardDescription className="text-center">Monthly</CardDescription>
                </CardHeader>
              </Card>
              
              <Card 
                className={`flex-1 cursor-pointer ${subscriptionDuration === 'yearly' ? 'border-primary' : ''}`}
                onClick={() => setSubscriptionDuration('yearly')}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-center">{formatPrice(selectedPlan?.priceYearly || 0)}</CardTitle>
                  <CardDescription className="text-center">Yearly</CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Note: This is a test subscription without payment integration.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={subscribing}>
              {subscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}