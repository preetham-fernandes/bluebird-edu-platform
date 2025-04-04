// src/lib/db/repositories/testRepository.ts
import prisma from '../prisma';

// Get test by ID with all questions and options
export const getTestById = async (id: number) => {
  return prisma.test.findUnique({
    where: { id },
    include: {
      aircraft: true,
      titleRef: true,
      questions: {
        orderBy: {
          questionNumber: 'asc',
        },
        include: {
          options: {
            orderBy: {
              label: 'asc',
            },
          },
        },
      },
    },
  });
};

// Get all tests by aircraft ID
export const getTestsByAircraftId = async (aircraftId: number) => {
  return prisma.test.findMany({
    where: { 
      aircraftId,
      isActive: true 
    },
    include: {
      titleRef: true,
    },
    orderBy: {
      title: 'asc',
    },
  });
};

// Get active tests by title ID
export const getActiveTestByTitleId = async (titleId: number) => {
  return prisma.test.findFirst({
    where: { 
      titleId,
      isActive: true 
    },
    include: {
      aircraft: true,
      titleRef: true,
      questions: {
        orderBy: {
          questionNumber: 'asc',
        },
        include: {
          options: {
            orderBy: {
              label: 'asc',
            },
          },
        },
      },
    },
  });
};

// Get tests by title name and aircraft
export const getTestByTitleAndAircraft = async (titleName: string, aircraftSlug: string) => {
  return prisma.test.findFirst({
    where: {
      isActive: true,
      titleRef: {
        name: titleName,
      },
      aircraft: {
        name: {
          contains: aircraftSlug.split('-').join(' '),
          // Use case-insensitive filtering
          equals: aircraftSlug.split('-').join(' '),
        },
      },
    },
    include: {
      aircraft: true,
      titleRef: true,
      questions: {
        orderBy: {
          questionNumber: 'asc',
        },
        include: {
          options: {
            orderBy: {
              label: 'asc',
            },
          },
        },
      },
    },
  });
};