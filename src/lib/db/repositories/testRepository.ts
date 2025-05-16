// src/lib/db/repositories/testRepository.ts
import prisma from '../prisma';

// Get test by ID with all questions and options
export const getTestById = async (id: number, testType?: string) => {
  return prisma.test.findUnique({
    where: { 
      id,
      // Add this condition if testType is provided
      ...(testType ? {
        titleRef: {
          testType: {
            type: testType
          }
        }
      } : {})
    },
    include: {
      aircraft: true,
      titleRef: {
        include: {
          testType: true,
        }
      },
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
      titleRef: {
        include: {
          testType: true,
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });
};

// Get tests by test type and title
export const getTestsByTypeAndTitle = async (testTypeId: number, titleId: number) => {
  return prisma.test.findMany({
    where: { 
      titleRef: {
        id: titleId,
        testTypeId: testTypeId,
      },
      isActive: true 
    },
    include: {
      aircraft: true,
      titleRef: {
        include: {
          testType: true,
        },
      },
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

export const getMockTestById = async (id: number) => {
  return prisma.test.findFirst({
    where: { 
      id,
      titleRef: {
        testType: {
          type: 'mock'
        }
      }
    },
    include: {
      aircraft: true,
      titleRef: {
        include: {
          testType: true,
        }
      },
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

// Create a specific method for practice tests
export const getPracticeTestById = async (id: number) => {
  return prisma.test.findFirst({
    where: { 
      id,
      titleRef: {
        testType: {
          type: 'practice'
        }
      }
    },
    include: {
      aircraft: true,
      titleRef: {
        include: {
          testType: true,
        }
      },
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