// src/lib/services/aircraftService.ts
import * as aircraftRepository from '../db/repositories/aircraftRepository';
import { Aircraft } from '@prisma/client';

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
  type: string; 
  isActive?: boolean 
}): Promise<Aircraft> => {
  return aircraftRepository.createAircraft(data);
};

// Update an aircraft
export const updateAircraft = async (
  id: number, 
  data: { 
    name?: string; 
    type?: string; 
    isActive?: boolean 
  }
): Promise<Aircraft> => {
  return aircraftRepository.updateAircraft(id, data);
};

// Delete an aircraft (soft delete)
export const deleteAircraft = async (id: number): Promise<Aircraft> => {
  return aircraftRepository.deleteAircraft(id);
};