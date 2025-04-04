// src/lib/services/titleService.ts
import * as titleRepository from '../db/repositories/titleRepository';

// Get all titles by aircraft ID with test count
export const getTitlesByAircraftId = async (aircraftId: number) => {
  const titles = await titleRepository.getTitlesByAircraftId(aircraftId);
  
  return titles.map(title => ({
    id: title.id,
    name: title.name,
    testType: title.testType.type,
    testCount: title.tests.length,
    createdAt: title.createdAt,
    updatedAt: title.updatedAt,
  }));
};

// Get all titles by aircraft name with test count
export const getTitlesByAircraftName = async (aircraftName: string) => {
  const titles = await titleRepository.getTitlesByAircraftName(aircraftName);
  
  return titles.map(title => ({
    id: title.id,
    name: title.name,
    testType: title.testType.type,
    testCount: title.tests.length,
    createdAt: title.createdAt,
    updatedAt: title.updatedAt,
  }));
};

// Get title by ID
export const getTitleById = async (id: number) => {
  const title = await titleRepository.getTitleById(id);
  
  if (!title) {
    return null;
  }
  
  return {
    id: title.id,
    name: title.name,
    testType: title.testType.type,
    testCount: title.tests.length,
    aircraftId: title.aircraftId,
    aircraftName: title.aircraft.name,
    createdAt: title.createdAt,
    updatedAt: title.updatedAt,
  };
};

// Get title by name and aircraft ID
export const getTitleByNameAndAircraftId = async (name: string, aircraftId: number) => {
  const title = await titleRepository.getTitleByNameAndAircraftId(name, aircraftId);
  
  if (!title) {
    return null;
  }
  
  return {
    id: title.id,
    name: title.name,
    testType: title.testType.type,
    testCount: title.tests.length,
    aircraftId: title.aircraftId,
    aircraftName: title.aircraft.name,
    createdAt: title.createdAt,
    updatedAt: title.updatedAt,
  };
};