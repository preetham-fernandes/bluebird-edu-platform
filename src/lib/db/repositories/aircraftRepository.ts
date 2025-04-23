import prisma from '../prisma';
import { Aircraft } from '@prisma/client';

export const getAllAircraft = async (): Promise<Aircraft[]> => {
  return prisma.aircraft.findMany({
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
  slug: string;
}): Promise<Aircraft> => {
  return prisma.aircraft.create({
    data
  });
};

export const updateAircraft = async (
  id: number, 
  data: { 
    name?: string; 
    slug?: string;
  }
): Promise<Aircraft> => {
  return prisma.aircraft.update({
    where: { id },
    data
  });
};

export const deleteAircraft = async (id: number): Promise<Aircraft> => {
  // Hard delete the aircraft
  return prisma.aircraft.delete({
    where: { id }
  });
};

export const getAircraftBySlug = async (slug: string): Promise<Aircraft | null> => {
  return prisma.aircraft.findUnique({
    where: { slug }
  });
};