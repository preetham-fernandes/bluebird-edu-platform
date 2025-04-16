"use client";

import { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Plane, CheckCircle2 } from "lucide-react";

interface Aircraft {
  id: number;
  name: string;
  type: string;
}

interface AircraftSelectorProps {
  selectedAircraft: { id: number; name: string } | null;
  onSelectAircraft: (aircraft: { id: number; name: string } | null) => void;
  onError: (error: string | null) => void;
}

export default function AircraftSelector({
  selectedAircraft,
  onSelectAircraft,
  onError
}: AircraftSelectorProps) {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAircraftName, setNewAircraftName] = useState('');
  const [newAircraftType, setNewAircraftType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        setLoading(true);
        onError(null);
        
        const response = await fetch('/api/admin/aircraft');
        
        if (!response.ok) {
          throw new Error('Failed to fetch aircraft');
        }
        
        const data = await response.json();
        setAircraft(data);
      } catch (err) {
        console.error('Error fetching aircraft:', err);
        onError(err instanceof Error ? err.message : 'Failed to load aircraft');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAircraft();
  }, [onError]);

  const handleSelectAircraft = (id: number, name: string) => {
    onSelectAircraft({ id, name });
  };

  const handleAddAircraft = async () => {
    if (!newAircraftName.trim() || !newAircraftType.trim()) {
      onError('Aircraft name and type are required');
      return;
    }

    try {
      setIsSubmitting(true);
      onError(null);
      
      const response = await fetch('/api/admin/aircraft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAircraftName,
          type: newAircraftType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add aircraft');
      }
      
      const newAircraft = await response.json();
      
      // Add the new aircraft to the list
      setAircraft(prev => [...prev, newAircraft]);
      
      // Select the newly added aircraft
      onSelectAircraft({ id: newAircraft.id, name: newAircraft.name });
      
      // Show success state
      setSubmissionSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        setDialogOpen(false);
        setSubmissionSuccess(false);
        setNewAircraftName('');
        setNewAircraftType('');
      }, 1500);
      
    } catch (err) {
      console.error('Error adding aircraft:', err);
      onError(err instanceof Error ? err.message : 'Failed to add aircraft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setNewAircraftName('');
      setNewAircraftType('');
      setSubmissionSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Aircraft</h2>
        
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add New Aircraft
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Aircraft</DialogTitle>
              <DialogDescription>
                Add a new aircraft to the system for test creation.
              </DialogDescription>
            </DialogHeader>
            
            {submissionSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Aircraft Added Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Your new aircraft has been added and selected.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="aircraft-name">Aircraft Name</Label>
                    <Input 
                      id="aircraft-name" 
                      placeholder="e.g., Boeing 737 MAX"
                      value={newAircraftName}
                      onChange={(e) => setNewAircraftName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aircraft-type">Aircraft Type</Label>
                    <Input 
                      id="aircraft-type" 
                      placeholder="e.g., Boeing"
                      value={newAircraftType}
                      onChange={(e) => setNewAircraftType(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAircraft} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Adding...' : 'Add Aircraft'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : aircraft.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Aircraft Available</h3>
            <p className="text-muted-foreground mb-4">
              There are no aircraft in the system yet. Add your first aircraft to continue.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Aircraft
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedAircraft ? selectedAircraft.id.toString() : ''}
          onValueChange={(value) => {
            const selected = aircraft.find(a => a.id.toString() === value);
            if (selected) {
              handleSelectAircraft(selected.id, selected.name);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {aircraft.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAircraft?.id === item.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectAircraft(item.id, item.name)}
            >
              <RadioGroupItem
                value={item.id.toString()}
                id={`aircraft-${item.id}`}
                className="sr-only"
              />
              <Label
                htmlFor={`aircraft-${item.id}`}
                className="flex items-start gap-3 cursor-pointer"
              >
                <Plane className={`h-5 w-5 mt-0.5 ${
                  selectedAircraft?.id === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Type: {item.type}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}