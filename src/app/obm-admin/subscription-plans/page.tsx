// src/app/obm-admin/subscription-plans/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2,
  AlertCircle,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Aircraft {
  id: number;
  name: string;
  slug: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  moduleType: string;
  moduleId: number;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  features: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionPlansPage() {
  const _router = useRouter();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    moduleType: 'aircraft',
    moduleId: '',
    priceMonthly: '',
    priceYearly: '',
    features: '',
    isActive: true
  });
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch subscription plans
        const plansResponse = await fetch('/api/admin/subscription-plans');
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        const plansData = await plansResponse.json();
        setPlans(plansData);
        
        // Fetch aircraft for selection
        const aircraftResponse = await fetch('/api/admin/aircraft-list');
        if (!aircraftResponse.ok) {
          throw new Error('Failed to fetch aircraft');
        }
        const aircraftData = await aircraftResponse.json();
        setAircraft(aircraftData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form change
  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    
    try {
      // Validate
      if (!formData.name || !formData.displayName || !formData.moduleId || 
          !formData.priceMonthly || !formData.priceYearly) {
        throw new Error('Please fill in all required fields');
      }
      
      // Parse features
      const featuresArray = formData.features
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
      
      // Create payload
      const payload = {
        ...formData,
        features: featuresArray.length > 0 ? featuresArray : null
      };
      
      // Submit
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create subscription plan');
      }
      
      // Success
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      
      // Reset form
      setFormData({
        name: '',
        displayName: '',
        description: '',
        moduleType: 'aircraft',
        moduleId: '',
        priceMonthly: '',
        priceYearly: '',
        features: '',
        isActive: true
      });
      
      // Close dialog
      setDialogOpen(false);
      
      // Refresh plans
      const plansResponse = await fetch('/api/admin/subscription-plans');
      const plansData = await plansResponse.json();
      setPlans(plansData);
      
    } catch (error) {
      console.error('Error creating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setFormLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Add a new subscription plan for your users.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="basic">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing & Features</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Internal Name *</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g., boeing-737-max"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Internal identifier, use lowercase with hyphens
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name *</Label>
                        <Input 
                          id="displayName" 
                          placeholder="e.g., Boeing 737 MAX"
                          value={formData.displayName}
                          onChange={(e) => handleChange('displayName', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Name shown to users
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe what's included in this subscription..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="moduleType">Module Type *</Label>
                        <Select
                          value={formData.moduleType}
                          onValueChange={(value) => handleChange('moduleType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aircraft">Aircraft</SelectItem>
                            <SelectItem value="subject">Subject</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="moduleId">Aircraft *</Label>
                        <Select
                          value={formData.moduleId}
                          onValueChange={(value) => handleChange('moduleId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select aircraft" />
                          </SelectTrigger>
                          <SelectContent>
                            {aircraft.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isActive" 
                        checked={formData.isActive}
                        onCheckedChange={(checked) => 
                          handleChange('isActive', checked === true)
                        }
                      />
                      <Label htmlFor="isActive">Plan is active</Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priceMonthly">Monthly Price (₹) *</Label>
                        <Input 
                          id="priceMonthly"
                          type="number" 
                          placeholder="e.g., 499"
                          value={formData.priceMonthly}
                          onChange={(e) => handleChange('priceMonthly', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priceYearly">Yearly Price (₹) *</Label>
                        <Input 
                          id="priceYearly"
                          type="number" 
                          placeholder="e.g., 4999"
                          value={formData.priceYearly}
                          onChange={(e) => handleChange('priceYearly', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea 
                        id="features" 
                        placeholder="All practice tests&#10;All mock tests&#10;Study materials&#10;Performance tracking"
                        value={formData.features}
                        onChange={(e) => handleChange('features', e.target.value)}
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter one feature per line. These will be displayed as bullet points.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Create Plan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <PlusIcon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Subscription Plans Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Create your first subscription plan to start offering premium content to your users.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.isActive ? "opacity-70" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.displayName}</CardTitle>
                  {plan.isActive ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <CardDescription>
                  {plan.moduleType === 'aircraft' ? 'Aircraft' : 'Subject'} Plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">₹{Number(plan.priceMonthly).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    ₹{Number(plan.priceYearly).toFixed(2)} billed yearly
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
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}