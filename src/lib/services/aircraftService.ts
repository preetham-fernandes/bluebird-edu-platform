// src/lib/services/aircraftService.ts
import * as aircraftRepository from '@/lib/db/repositories/aircraftRepository';

export interface Aircraft {
  id: number;
  name: string;
  slug: string;
}

// Get all active aircraft
export const getAllAircraft = async (): Promise<Aircraft[]> => {
  return aircraftRepository.getAllAircraft();
};

// Get aircraft by ID
export const getAircraftById = async (id: number): Promise<Aircraft | null> => {
  return aircraftRepository.getAircraftById(id);
};

// Get aircraft by slug
export const getAircraftBySlug = async (slug: string): Promise<Aircraft | null> => {
  return aircraftRepository.getAircraftBySlug(slug);
};

// Create a new aircraft
export const createAircraft = async (data: { 
  name: string; 
  slug: string;
}): Promise<Aircraft> => {
  return aircraftRepository.createAircraft(data);
};

// Update an aircraft
export const updateAircraft = async (
  id: number, 
  data: { 
    name?: string; 
    slug?: string;
  }
): Promise<Aircraft> => {
  return aircraftRepository.updateAircraft(id, data);
};

// Delete an aircraft (soft delete)
export const deleteAircraft = async (id: number): Promise<Aircraft> => {
  return aircraftRepository.deleteAircraft(id);
};