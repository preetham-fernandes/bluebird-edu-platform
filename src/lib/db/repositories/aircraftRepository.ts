import prisma from '../prisma';
import { Aircraft } from '@prisma/client';

export const getAllAircraft = async (): Promise<Aircraft[]> => {
  return prisma.aircraft.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

export const getAircraftById = async (id: number): Promise<Aircraft | null> => {
  return prisma.aircraft.findUnique({
    where: { id }
  });
};

export const createAircraft = async (data: { 
  name: string; 
  type: string; 
  isActive?: boolean 
}): Promise<Aircraft> => {
  return prisma.aircraft.create({
    data
  });
};

export const updateAircraft = async (
  id: number, 
  data: { 
    name?: string; 
    type?: string; 
    isActive?: boolean 
  }
): Promise<Aircraft> => {
  return prisma.aircraft.update({
    where: { id },
    data
  });
};

export const deleteAircraft = async (id: number): Promise<Aircraft> => {
  // Soft delete by setting isActive to false
  return prisma.aircraft.update({
    where: { id },
    data: { isActive: false }
  });
};