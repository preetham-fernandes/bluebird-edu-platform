import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed Aircraft data
  const boeing737 = await prisma.aircraft.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Boeing 737 Max',
      type: 'Boeing',
      isActive: true,
    },
  });

  const airbusA320 = await prisma.aircraft.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Airbus A320',
      type: 'Airbus',
      isActive: true,
    },
  });

  console.log({ boeing737, airbusA320 });

  // Seed Subject data
  const systems = await prisma.subject.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Aircraft Systems',
      description: 'Study of major aircraft systems and components',
    },
  });

  const procedures = await prisma.subject.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Standard Operating Procedures',
      description: 'Normal and abnormal operating procedures',
    },
  });

  const performance = await prisma.subject.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Performance',
      description: 'Aircraft performance characteristics and limitations',
    },
  });

  console.log({ systems, procedures, performance });

  // Create a sample test for Boeing 737 Systems
  const sampleTestContent = {
    questions: [
      {
        id: '1',
        text: 'What is the maximum operating altitude of the Boeing 737 Max?',
        options: [
          { id: 'a', text: '39,000 ft' },
          { id: 'b', text: '41,000 ft' },
          { id: 'c', text: '42,000 ft' },
          { id: 'd', text: '43,000 ft' }
        ],
        correctAnswer: 'b',
        explanation: 'The Boeing 737 Max has a maximum operating altitude of 41,000 ft.'
      },
      {
        id: '2',
        text: 'Which of the following is NOT a component of the Boeing 737 Max hydraulic system?',
        options: [
          { id: 'a', text: 'System A' },
          { id: 'b', text: 'System B' },
          { id: 'c', text: 'System C' },
          { id: 'd', text: 'System D' }
        ],
        correctAnswer: 'd',
        explanation: 'The Boeing 737 Max has three hydraulic systems: A, B, and C. There is no System D.'
      },
      {
        id: '3',
        text: 'What type of engines are used on the Boeing 737 Max?',
        options: [
          { id: 'a', text: 'CFM LEAP-1B' },
          { id: 'b', text: 'Pratt & Whitney PW1000G' },
          { id: 'c', text: 'Rolls-Royce Trent 1000' },
          { id: 'd', text: 'GE Aviation GEnx' }
        ],
        correctAnswer: 'a',
        explanation: 'The Boeing 737 Max uses CFM LEAP-1B engines exclusively.'
      }
    ]
  };

  const boeing737SystemsTest = await prisma.test.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Boeing 737 Max Systems Basic Knowledge',
      subjectId: 1, // Systems
      aircraftId: 1, // Boeing 737 Max
      content: sampleTestContent,
      totalQuestions: 3,
      passingScore: 70.0,
      timeLimit: 60, // 1 hour
      updatedBy: 1, // Assuming admin ID 1
      isActive: true
    },
  });

  console.log({ boeing737SystemsTest });

  // Create a sample admin user (temporary until authentication is implemented)
  const adminUser = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      email: 'admin@bluebird-edu.com',
      name: 'Admin User',
      timezone: 'UTC',
      deviceType: 'desktop'
    },
  });

  console.log({ adminUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });