// src/lib/db/repositories/titleRepository.ts
import prisma from '../prisma';

// Get all titles by aircraft ID
export const getTitlesByAircraftId = async (aircraftId: number) => {
  return prisma.title.findMany({
    where: { aircraftId },
    include: {
      testType: true,
      tests: {
        where: { isActive: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

// Get all titles by aircraft name
export const getTitlesByAircraftName = async (aircraftName: string) => {
  return prisma.title.findMany({
    where: {
      aircraft: {
        name: {
          contains: aircraftName,
          mode: 'insensitive',
        },
      },
    },
    include: {
      testType: true,
      tests: {
        where: { isActive: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

// Get title by ID
export const getTitleById = async (id: number) => {
  return prisma.title.findUnique({
    where: { id },
    include: {
      testType: true,
      aircraft: true,
      tests: {
        where: { isActive: true },
      },
    },
  });
};

// Get title by name and aircraft ID
export const getTitleByNameAndAircraftId = async (name: string, aircraftId: number) => {
  return prisma.title.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      aircraftId,
    },
    include: {
      testType: true,
      aircraft: true,
      tests: {
        where: { isActive: true },
      },
    },
  });
};