// src/app/obm-admin/[aircraft]/mock-test/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SubjectsGrid from '@/components/admin/SubjectsGrid';

interface Aircraft {
  id: number;
  name: string;
  type: string;
}

export default function MockTestsPage() {
  const params = useParams();
  const aircraftSlug = params.aircraft as string;
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        setLoading(true);
        // Use the aircraft API endpoint which now uses the service & repository pattern
        const response = await fetch(`/api/admin/aircraft?slug=${aircraftSlug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch aircraft details');
        }
        
        const data = await response.json();
        setAircraft(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (aircraftSlug) {
      fetchAircraft();
    }
  }, [aircraftSlug]);

  if (loading) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }

  if (error || !aircraft) {
    return (
      <div className="p-8 flex justify-center">
        <div className="text-destructive">
          {error || 'Aircraft not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubjectsGrid 
        aircraftId={aircraft.id}
        aircraftName={aircraft.name}
        testType="mock"
      />
    </div>
  );
}