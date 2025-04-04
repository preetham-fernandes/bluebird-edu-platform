import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const aircraftCount = await prisma.aircraft.count();
    
    // Create the Boeing 737 MAX aircraft
    const boeing737max = await prisma.aircraft.create({
      data: {
        name: 'Boeing 737 MAX',
        type: 'Boeing',
      },
    });
  
  console.log('Aircraft created:', boeing737max.name, boeing737max.id);
  
  // Create the mock test type
  const mockTestType = await prisma.testType.create({
    data: {
      type: 'mock',
    },
  });
  
  console.log('Mock test type created:', mockTestType.type, mockTestType.id);
  
  // Create the practice test type
  const practiceTestType = await prisma.testType.create({
    data: {
      type: 'practice',
    },
  });
  
  console.log('Practice test type created:', practiceTestType.type, practiceTestType.id);

    console.log('Test type created or found:', practiceTestType.type, practiceTestType.id);

    // Create the "0 Limitations" title
    const limitationsTitle = await prisma.title.create({
      data: {
        name: '0 Limitations',
        aircraftId: boeing737max.id,
        testTypeId: practiceTestType.id,
      },
    });

    console.log('Title created:', limitationsTitle.name, limitationsTitle.id);

    // Create the test
    const limitationsTest = await prisma.test.create({
      data: {
        title: '0 Limitations Practice Test',
        titleId: limitationsTitle.id,
        aircraftId: boeing737max.id,
        totalQuestions: 50,
        timeLimit: 60, // 1 hour for practice test
        updatedBy: 1, // Assuming admin ID 1
        isActive: true,
      },
    });

    console.log('Test created:', limitationsTest.title, limitationsTest.id);

    // Define the questions from the CSV data
    const questions = [
      {
        questionNumber: 1,
        questionText: "What is the maximum flight operating latitude for the B737 MAX, except for specific regions?",
        correctAnswer: "D",
        explanation: "The standard maximum operating latitude is 82° North and South, except for certain restricted longitudinal areas.",
        options: [
          { label: "A", optionText: "90° North and 90° South", isCorrect: false },
          { label: "B", optionText: "85° North and 85° South", isCorrect: false },
          { label: "C", optionText: "73° North and 60° South", isCorrect: false },
          { label: "D", optionText: "82° North and 82° South", isCorrect: true },
        ]
      },
      {
        questionNumber: 2,
        questionText: "What thrust setting is required during taxi when crosswinds exceed 43 knots?",
        correctAnswer: "C",
        explanation: "When crosswinds exceed 43 knots, thrust must be limited to taxi-level settings.",
        options: [
          { label: "A", optionText: "Idle thrust only", isCorrect: false },
          { label: "B", optionText: "Use maximum takeoff thrust", isCorrect: false },
          { label: "C", optionText: "Use a thrust setting normally used for taxi", isCorrect: true },
          { label: "D", optionText: "Do not taxi in these conditions", isCorrect: false },
        ]
      },
      {
        questionNumber: 3,
        questionText: "For wind speeds exceeding 58 knots, what is the engine thrust limitation (except when setting takeoff thrust on the runway)?",
        correctAnswer: "B",
        explanation: "For winds greater than 58 knots, engine thrust must be limited to idle unless setting takeoff thrust.",
        options: [
          { label: "A", optionText: "Maximum thrust allowed", isCorrect: false },
          { label: "B", optionText: "Idle thrust only", isCorrect: true },
          { label: "C", optionText: "Climb thrust permitted", isCorrect: false },
          { label: "D", optionText: "Takeoff thrust is always allowed", isCorrect: false },
        ]
      },
      {
        questionNumber: 4,
        questionText: "Under FAA operational approval, what is the maximum tailwind component allowed for takeoff and landing?",
        correctAnswer: "B",
        explanation: "Although aircraft performance allows up to 15 knots, FAA operations are limited to 10 knots tailwind.",
        options: [
          { label: "A", optionText: "15 knots", isCorrect: false },
          { label: "B", optionText: "10 knots", isCorrect: true },
          { label: "C", optionText: "12 knots", isCorrect: false },
          { label: "D", optionText: "20 knots", isCorrect: false },
        ]
      },
      {
        questionNumber: 5,
        questionText: "What is the maximum operating altitude of the B737 MAX?",
        correctAnswer: "B",
        explanation: "The maximum operating altitude is 41,000 feet pressure altitude.",
        options: [
          { label: "A", optionText: "40,000 feet", isCorrect: false },
          { label: "B", optionText: "41,000 feet", isCorrect: true },
          { label: "C", optionText: "43,000 feet", isCorrect: false },
          { label: "D", optionText: "39,000 feet", isCorrect: false },
        ]
      },
      {
        questionNumber: 6,
        questionText: "What is the Severe Turbulent Air Penetration Speed for climb and descent?",
        correctAnswer: "D",
        explanation: "The limitation is 280 knots indicated airspeed or Mach 0.76, whichever is lower.",
        options: [
          { label: "A", optionText: "270 KIAS / .78M", isCorrect: false },
          { label: "B", optionText: "250 KIAS / .80M", isCorrect: false },
          { label: "C", optionText: "300 KIAS / .74M", isCorrect: false },
          { label: "D", optionText: "280 KIAS / .76M", isCorrect: true },
        ]
      },
      {
        questionNumber: 7,
        questionText: "What is the maximum in-flight altitude display difference allowed between Captain and First Officer in RVSM airspace?",
        correctAnswer: "C",
        explanation: "The maximum allowable difference is 200 feet in flight for RVSM operations.",
        options: [
          { label: "A", optionText: "100 feet", isCorrect: false },
          { label: "B", optionText: "150 feet", isCorrect: false },
          { label: "C", optionText: "200 feet", isCorrect: true },
          { label: "D", optionText: "75 feet", isCorrect: false },
        ]
      },
      {
        questionNumber: 8,
        questionText: "What is the AFM Maximum Taxi Weight for the B737 MAX?",
        correctAnswer: "C",
        explanation: "The AFM specifies 82,417 kilograms as the max taxi weight.",
        options: [
          { label: "A", optionText: "82,000 kg", isCorrect: false },
          { label: "B", optionText: "81,500 kg", isCorrect: false },
          { label: "C", optionText: "82,417 kg", isCorrect: true },
          { label: "D", optionText: "83,000 kg", isCorrect: false },
        ]
      },
      {
        questionNumber: 9,
        questionText: "What is the maximum cabin differential pressure?",
        correctAnswer: "C",
        explanation: "Maximum cabin pressure differential is limited to 9.1 psi as per AFM.",
        options: [
          { label: "A", optionText: "8.9 psi", isCorrect: false },
          { label: "B", optionText: "9.0 psi", isCorrect: false },
          { label: "C", optionText: "9.1 psi", isCorrect: true },
          { label: "D", optionText: "9.5 psi", isCorrect: false },
        ]
      },
      {
        questionNumber: 10,
        questionText: "Is the use of aileron trim allowed while the autopilot is engaged?",
        correctAnswer: "C",
        explanation: "The use of aileron trim is prohibited when the autopilot is engaged.",
        options: [
          { label: "A", optionText: "Yes, during cruise", isCorrect: false },
          { label: "B", optionText: "Yes, only above 10,000 feet", isCorrect: false },
          { label: "C", optionText: "No", isCorrect: true },
          { label: "D", optionText: "Only in approach phase", isCorrect: false },
        ]
      },
      {
        questionNumber: 11,
        questionText: "What is the minimum altitude to engage the autopilot after takeoff?",
        correctAnswer: "B",
        explanation: "Autopilot must not be engaged below 400 feet AGL during takeoff.",
        options: [
          { label: "A", optionText: "1000 feet AGL", isCorrect: false },
          { label: "B", optionText: "400 feet AGL", isCorrect: true },
          { label: "C", optionText: "200 feet AGL", isCorrect: false },
          { label: "D", optionText: "500 feet AGL", isCorrect: false },
        ]
      },
      {
        questionNumber: 12,
        questionText: "What is the maximum tailwind component allowed for autoland?",
        correctAnswer: "C",
        explanation: "For autoland operations, a tailwind of up to 15 knots is permitted.",
        options: [
          { label: "A", optionText: "5 knots", isCorrect: false },
          { label: "B", optionText: "10 knots", isCorrect: false },
          { label: "C", optionText: "15 knots", isCorrect: true },
          { label: "D", optionText: "20 knots", isCorrect: false },
        ]
      },
      {
        questionNumber: 13,
        questionText: "When both SATCOM channels are in use, what must be displayed on one of the CDUs?",
        correctAnswer: "B",
        explanation: "One CDU must show the SAT-PHONE 1/2 page when both SATCOM channels are active.",
        options: [
          { label: "A", optionText: "Weather radar display", isCorrect: false },
          { label: "B", optionText: "SAT-PHONE 1/2 page", isCorrect: true },
          { label: "C", optionText: "VHF status page", isCorrect: false },
          { label: "D", optionText: "ACARS page", isCorrect: false },
        ]
      },
      {
        questionNumber: 14,
        questionText: "What is the maximum permissible tank fuel temperature?",
        correctAnswer: "D",
        explanation: "Maximum tank fuel temperature is 49 degrees Celsius.",
        options: [
          { label: "A", optionText: "45°C", isCorrect: false },
          { label: "B", optionText: "50°C", isCorrect: false },
          { label: "C", optionText: "47°C", isCorrect: false },
          { label: "D", optionText: "49°C", isCorrect: true },
        ]
      },
      {
        questionNumber: 15,
        questionText: "What is the minimum fuel tank temperature prior to takeoff and during flight?",
        correctAnswer: "A",
        explanation: "The fuel temperature must be above –43°C or at least 3°C above the fuel's freezing point.",
        options: [
          { label: "A", optionText: "–43°C or 3°C above freezing point, whichever is higher", isCorrect: true },
          { label: "B", optionText: "–47°C", isCorrect: false },
          { label: "C", optionText: "–45°C", isCorrect: false },
          { label: "D", optionText: "–40°C", isCorrect: false },
        ]
      },
      {
        questionNumber: 16,
        questionText: "What is the maximum allowable crosswind component for autoland operations under FAA rules?",
        correctAnswer: "C",
        explanation: "Under FAA rules, the maximum crosswind for autoland is 25 knots.",
        options: [
          { label: "A", optionText: "15 knots", isCorrect: false },
          { label: "B", optionText: "20 knots", isCorrect: false },
          { label: "C", optionText: "25 knots", isCorrect: true },
          { label: "D", optionText: "30 knots", isCorrect: false },
        ]
      },
      {
        questionNumber: 17,
        questionText: "What is the minimum and maximum glide slope angle range for autoland operations?",
        correctAnswer: "A",
        explanation: "Autoland is only permitted when glide slope angle is between 2.5 and 3.25 degrees.",
        options: [
          { label: "A", optionText: "2.5° to 3.25°", isCorrect: true },
          { label: "B", optionText: "2.0° to 3.5°", isCorrect: false },
          { label: "C", optionText: "2.5° to 3.5°", isCorrect: false },
          { label: "D", optionText: "2.7° to 3.3°", isCorrect: false },
        ]
      },
      {
        questionNumber: 18,
        questionText: "What flap settings are required for autoland operations with both engines operative?",
        correctAnswer: "C",
        explanation: "Autoland must be done with Flaps 30 or 40 and both engines operative.",
        options: [
          { label: "A", optionText: "Flaps 15 only", isCorrect: false },
          { label: "B", optionText: "Flaps 25 or 30", isCorrect: false },
          { label: "C", optionText: "Flaps 30 or 40", isCorrect: true },
          { label: "D", optionText: "Any flap setting", isCorrect: false },
        ]
      },
      {
        questionNumber: 19,
        questionText: "During refueling operations, what communication equipment must not be used?",
        correctAnswer: "B",
        explanation: "Operating HF radios during refueling is strictly prohibited due to safety risks.",
        options: [
          { label: "A", optionText: "VHF radio", isCorrect: false },
          { label: "B", optionText: "HF radio", isCorrect: true },
          { label: "C", optionText: "SATCOM", isCorrect: false },
          { label: "D", optionText: "Interphone", isCorrect: false },
        ]
      },
      {
        questionNumber: 20,
        questionText: "What type of messages are not permitted over ACARS due to the potential for unsafe conditions?",
        correctAnswer: "C",
        explanation: "ACARS must only carry messages that won't create an unsafe condition if corrupted.",
        options: [
          { label: "A", optionText: "Weather reports", isCorrect: false },
          { label: "B", optionText: "Position updates", isCorrect: false },
          { label: "C", optionText: "Critical operational commands", isCorrect: true },
          { label: "D", optionText: "Digital ATIS", isCorrect: false },
        ]
      },
      {
        questionNumber: 21,
        questionText: "When both engine BLEED air switches are ON, in which phase must air conditioning packs NOT be operated in HIGH?",
        correctAnswer: "C",
        explanation: "Operating packs in HIGH is prohibited during takeoff, approach, and landing unless required by fire/smoke checklists.",
        options: [
          { label: "A", optionText: "Cruise", isCorrect: false },
          { label: "B", optionText: "Descent", isCorrect: false },
          { label: "C", optionText: "Takeoff, approach, or landing", isCorrect: true },
          { label: "D", optionText: "Taxi", isCorrect: false },
        ]
      },
      {
        questionNumber: 22,
        questionText: "What must be done before departure whenever passengers are on board?",
        correctAnswer: "C",
        explanation: "Overwing exit handle covers must be verified installed when passengers are carried.",
        options: [
          { label: "A", optionText: "Turn off SATCOM", isCorrect: false },
          { label: "B", optionText: "Remove overwing handle covers", isCorrect: false },
          { label: "C", optionText: "Verify installation of overwing exit handle covers", isCorrect: true },
          { label: "D", optionText: "Check APU fuel quantity", isCorrect: false },
        ]
      },
      {
        questionNumber: 23,
        questionText: "What is the APU bleed + electrical load altitude limit inflight under FAA rules?",
        correctAnswer: "B",
        explanation: "When both APU bleed and electrical are used inflight, the limit is 10,000 feet.",
        options: [
          { label: "A", optionText: "15,000 feet", isCorrect: false },
          { label: "B", optionText: "10,000 feet", isCorrect: true },
          { label: "C", optionText: "17,000 feet", isCorrect: false },
          { label: "D", optionText: "25,000 feet", isCorrect: false },
        ]
      },
      {
        questionNumber: 24,
        questionText: "What is the maximum altitude for using APU electrical power alone?",
        correctAnswer: "A",
        explanation: "The APU can supply electrical power alone up to 41,000 feet.",
        options: [
          { label: "A", optionText: "41,000 feet", isCorrect: true },
          { label: "B", optionText: "37,000 feet", isCorrect: false },
          { label: "C", optionText: "33,000 feet", isCorrect: false },
          { label: "D", optionText: "39,000 feet", isCorrect: false },
        ]
      },
      {
        questionNumber: 25,
        questionText: "After three consecutive aborted APU starts, what is the required cooling period?",
        correctAnswer: "C",
        explanation: "A 15-minute cooling period is needed after three aborted APU start attempts.",
        options: [
          { label: "A", optionText: "5 minutes", isCorrect: false },
          { label: "B", optionText: "10 minutes", isCorrect: false },
          { label: "C", optionText: "15 minutes", isCorrect: true },
          { label: "D", optionText: "20 minutes", isCorrect: false },
        ]
      },
      {
        questionNumber: 26,
        questionText: "What is the maximum altitude at which flaps can be extended?",
        correctAnswer: "C",
        explanation: "Flaps must not be extended above 20,000 feet.",
        options: [
          { label: "A", optionText: "18,000 feet", isCorrect: false },
          { label: "B", optionText: "15,000 feet", isCorrect: false },
          { label: "C", optionText: "20,000 feet", isCorrect: true },
          { label: "D", optionText: "25,000 feet", isCorrect: false },
        ]
      },
      {
        questionNumber: 27,
        questionText: "Is it permissible to hold in icing conditions with flaps extended?",
        correctAnswer: "B",
        explanation: "Holding with flaps extended in icing conditions is prohibited.",
        options: [
          { label: "A", optionText: "Yes", isCorrect: false },
          { label: "B", optionText: "No", isCorrect: true },
          { label: "C", optionText: "Only if above 10,000 feet", isCorrect: false },
          { label: "D", optionText: "Yes, with anti-ice ON", isCorrect: false },
        ]
      },
      {
        questionNumber: 28,
        questionText: "What is the correct duty cycle for alternate flap extension/retraction?",
        correctAnswer: "D",
        explanation: "Allow 15 seconds between switch movements and 5 minutes cooling after a full cycle.",
        options: [
          { label: "A", optionText: "Wait 1 minute between movements", isCorrect: false },
          { label: "B", optionText: "Wait 15 seconds between switch actions", isCorrect: false },
          { label: "C", optionText: "Wait 5 minutes after a full extend/retract cycle", isCorrect: false },
          { label: "D", optionText: "Both B and C", isCorrect: true },
        ]
      },
      {
        questionNumber: 29,
        questionText: "What is the minimum fuel tank temperature permitted prior to takeoff or during flight?",
        correctAnswer: "D",
        explanation: "Fuel temperature must be at least –43°C or 3°C above the freezing point, whichever is higher.",
        options: [
          { label: "A", optionText: "–45°C", isCorrect: false },
          { label: "B", optionText: "–43°C", isCorrect: false },
          { label: "C", optionText: "3°C above freezing point", isCorrect: false },
          { label: "D", optionText: "The higher of –43°C or 3°C above freezing point", isCorrect: true },
        ]
      },
      {
        questionNumber: 30,
        questionText: "What is the maximum allowable fuel imbalance between main wing tanks during any phase of flight?",
        correctAnswer: "B",
        explanation: "Fuel imbalance between main tanks must not exceed 453 kilograms.",
        options: [
          { label: "A", optionText: "300 kg", isCorrect: false },
          { label: "B", optionText: "453 kg", isCorrect: true },
          { label: "C", optionText: "500 kg", isCorrect: false },
          { label: "D", optionText: "Zero", isCorrect: false },
        ]
      },
      {
        questionNumber: 31,
        questionText: "Under what condition must main tanks 1 and 2 be full before departure?",
        correctAnswer: "A",
        explanation: "If center tank fuel exceeds 453 kg, both main tanks must be full.",
        options: [
          { label: "A", optionText: "If center tank contains more than 453 kg", isCorrect: true },
          { label: "B", optionText: "If APU is running", isCorrect: false },
          { label: "C", optionText: "If passengers are onboard", isCorrect: false },
          { label: "D", optionText: "During long-haul flights", isCorrect: false },
        ]
      },
      {
        questionNumber: 32,
        questionText: "What is the maximum allowable taxi, takeoff, flight, or landing fuel imbalance between main wing tanks?",
        correctAnswer: "B",
        explanation: "Fuel imbalance must not exceed 453 kg during any phase.",
        options: [
          { label: "A", optionText: "300 kg", isCorrect: false },
          { label: "B", optionText: "453 kg", isCorrect: true },
          { label: "C", optionText: "500 kg", isCorrect: false },
          { label: "D", optionText: "400 kg", isCorrect: false },
        ]
      },
      {
        questionNumber: 33,
        questionText: "Is intentional dry running of a center tank fuel pump permitted?",
        correctAnswer: "C",
        explanation: "Dry running of a center tank fuel pump is prohibited when the low pressure light is illuminated.",
        options: [
          { label: "A", optionText: "Yes, if monitored", isCorrect: false },
          { label: "B", optionText: "Yes, if less than 5 minutes", isCorrect: false },
          { label: "C", optionText: "No", isCorrect: true },
          { label: "D", optionText: "Only during descent", isCorrect: false },
        ]
      },
      {
        questionNumber: 34,
        questionText: "When must engine ignition be ON?",
        correctAnswer: "C",
        explanation: "Engine ignition must be ON during takeoff, landing, heavy rain, and anti-ice use.",
        options: [
          { label: "A", optionText: "During cruise", isCorrect: false },
          { label: "B", optionText: "Only when anti-ice is on", isCorrect: false },
          { label: "C", optionText: "During takeoff, landing, heavy rain, and anti-ice operation", isCorrect: true },
          { label: "D", optionText: "During taxi", isCorrect: false },
        ]
      },
      {
        questionNumber: 35,
        questionText: "What color are engine limit display markings for maximum and minimum limits?",
        correctAnswer: "B",
        explanation: "Maximum and minimum limits are marked in red; caution ranges in amber.",
        options: [
          { label: "A", optionText: "Amber", isCorrect: false },
          { label: "B", optionText: "Red", isCorrect: true },
          { label: "C", optionText: "White", isCorrect: false },
          { label: "D", optionText: "Green", isCorrect: false },
        ]
      },
      {
        questionNumber: 36,
        questionText: "Is intentional selection of reverse thrust in flight allowed?",
        correctAnswer: "C",
        explanation: "Selecting reverse thrust in flight is strictly prohibited.",
        options: [
          { label: "A", optionText: "Yes, below 10,000 feet", isCorrect: false },
          { label: "B", optionText: "Only in emergencies", isCorrect: false },
          { label: "C", optionText: "No", isCorrect: true },
          { label: "D", optionText: "Yes, if idle thrust", isCorrect: false },
        ]
      },
      {
        questionNumber: 37,
        questionText: "Can the airplane be backed using reverse thrust?",
        correctAnswer: "D",
        explanation: "Backing the aircraft using reverse thrust is prohibited.",
        options: [
          { label: "A", optionText: "Yes, at low power", isCorrect: false },
          { label: "B", optionText: "Only during taxi", isCorrect: false },
          { label: "C", optionText: "Yes, with ground personnel approval", isCorrect: false },
          { label: "D", optionText: "No", isCorrect: true },
        ]
      },
      {
        questionNumber: 38,
        questionText: "Can go-around be attempted after thrust reverser deployment on landing?",
        correctAnswer: "C",
        explanation: "Go-arounds are not allowed after thrust reversers have been deployed.",
        options: [
          { label: "A", optionText: "Yes", isCorrect: false },
          { label: "B", optionText: "Only if one reverser was used", isCorrect: false },
          { label: "C", optionText: "No", isCorrect: true },
          { label: "D", optionText: "Yes, under 60 knots", isCorrect: false },
        ]
      },
      {
        questionNumber: 39,
        questionText: "What is the maximum differential pressure for the cabin (relief valve limit)?",
        correctAnswer: "C",
        explanation: "The maximum cabin differential pressure is 9.1 psi.",
        options: [
          { label: "A", optionText: "9.0 psi", isCorrect: false },
          { label: "B", optionText: "9.3 psi", isCorrect: false },
          { label: "C", optionText: "9.1 psi", isCorrect: true },
          { label: "D", optionText: "8.9 psi", isCorrect: false },
        ]
      },
      {
        questionNumber: 40,
        questionText: "What is the maximum altitude with flaps extended?",
        correctAnswer: "C",
        explanation: "Flaps must not be extended above 20,000 feet.",
        options: [
          { label: "A", optionText: "15,000 feet", isCorrect: false },
          { label: "B", optionText: "18,000 feet", isCorrect: false },
          { label: "C", optionText: "20,000 feet", isCorrect: true },
          { label: "D", optionText: "22,000 feet", isCorrect: false },
        ]
      },
      {
        questionNumber: 41,
        questionText: "Is use of speed brakes below 1,000 feet above the surface allowed?",
        correctAnswer: "C",
        explanation: "Speed brakes must not be used below 1,000 feet above ground level.",
        options: [
          { label: "A", optionText: "Yes", isCorrect: false },
          { label: "B", optionText: "Only in emergencies", isCorrect: false },
          { label: "C", optionText: "No", isCorrect: true },
          { label: "D", optionText: "Yes, with flaps up", isCorrect: false },
        ]
      },
      {
        questionNumber: 42,
        questionText: "With flaps 40 selected, what is the speedbrake restriction?",
        correctAnswer: "B",
        explanation: "With flaps 40, speedbrake lever must not be moved beyond the ARMED detent.",
        options: [
          { label: "A", optionText: "Speedbrake can be used fully", isCorrect: false },
          { label: "B", optionText: "Must not go beyond ARMED detent", isCorrect: true },
          { label: "C", optionText: "May be used at pilot's discretion", isCorrect: false },
          { label: "D", optionText: "Use only during descent", isCorrect: false },
        ]
      },
      {
        questionNumber: 43,
        questionText: "What altitude must be avoided when aligning the ADIRU?",
        correctAnswer: "C",
        explanation: "Alignment must not be attempted at latitudes beyond 78° 15′.",
        options: [
          { label: "A", optionText: "Over 80° North", isCorrect: false },
          { label: "B", optionText: "Over 60° South", isCorrect: false },
          { label: "C", optionText: "Greater than 78° 15′", isCorrect: true },
          { label: "D", optionText: "Near equator", isCorrect: false },
        ]
      },
      {
        questionNumber: 44,
        questionText: "What is the maximum permissible IRS MagVar error for flight operations based on magnetic heading or track?",
        correctAnswer: "D",
        explanation: "Operations are not permitted in areas where MagVar errors exceed 5 degrees.",
        options: [
          { label: "A", optionText: "2°", isCorrect: false },
          { label: "B", optionText: "3°", isCorrect: false },
          { label: "C", optionText: "4°", isCorrect: false },
          { label: "D", optionText: "5°", isCorrect: true },
        ]
      },
      {
        questionNumber: 45,
        questionText: "What is the restriction on LNAV/VNAV when altimeters are referenced to QFE?",
        correctAnswer: "C",
        explanation: "VNAV and LNAV are prohibited when altimeters are set to QFE.",
        options: [
          { label: "A", optionText: "Can be used in cruise", isCorrect: false },
          { label: "B", optionText: "Only VNAV is allowed", isCorrect: false },
          { label: "C", optionText: "Not allowed", isCorrect: true },
          { label: "D", optionText: "Only allowed with dual GPS", isCorrect: false },
        ]
      },
      {
        questionNumber: 46,
        questionText: "Should terrain display be used for navigation?",
        correctAnswer: "C",
        explanation: "Terrain display must not be used for navigation.",
        options: [
          { label: "A", optionText: "Yes", isCorrect: false },
          { label: "B", optionText: "Only in mountainous areas", isCorrect: false },
          { label: "C", optionText: "No", isCorrect: true },
          { label: "D", optionText: "Yes, when GPS is lost", isCorrect: false },
        ]
      },
      {
        questionNumber: 47,
        questionText: "When should you not use look-ahead terrain alerting and display functions?",
        correctAnswer: "B",
        explanation: "Terrain alerting must not be used within 15 nm of airports not in the GPWS database.",
        options: [
          { label: "A", optionText: "At cruise altitude", isCorrect: false },
          { label: "B", optionText: "Within 15 nm of takeoff/landing at unlisted airports", isCorrect: true },
          { label: "C", optionText: "During descent", isCorrect: false },
          { label: "D", optionText: "When GPWS is OFF", isCorrect: false },
        ]
      },
      {
        questionNumber: 48,
        questionText: "What condition should be met before disabling overrun alerting?",
        correctAnswer: "B",
        explanation: "Overrun alerting should be inhibited if temperature or weight conditions are outside limits.",
        options: [
          { label: "A", optionText: "Runway is wet", isCorrect: false },
          { label: "B", optionText: "OAT is below –40°C or above 50°C, or gross weight exceeds max landing weight", isCorrect: true },
          { label: "C", optionText: "Aircraft is in final approach", isCorrect: false },
          { label: "D", optionText: "Visual approach is being flown", isCorrect: false },
        ]
      },
      {
        questionNumber: 49,
        questionText: "What is the caution when operating weather radar on the ground?",
        correctAnswer: "C",
        explanation: "Avoid radar operation in hangars or near personnel unless in test mode.",
        options: [
          { label: "A", optionText: "Not allowed in rain", isCorrect: false },
          { label: "B", optionText: "Must be in test mode", isCorrect: false },
          { label: "C", optionText: "Avoid operating in hangar or near personnel", isCorrect: true },
          { label: "D", optionText: "Only use when taxiing", isCorrect: false },
        ]
      },
      {
        questionNumber: 50,
        questionText: "Should RAAS callouts be used as navigation or NOTAM substitutes?",
        correctAnswer: "B",
        explanation: "RAAS callouts must not be used for navigation or as substitutes for NOTAMs or ATIS.",
        options: [
          { label: "A", optionText: "Yes, during low visibility", isCorrect: false },
          { label: "B", optionText: "No", isCorrect: true },
          { label: "C", optionText: "Only on unfamiliar airports", isCorrect: false },
          { label: "D", optionText: "Yes, with ATC approval", isCorrect: false },
        ]
      }
    ];

    // Create all questions and options
    for (const question of questions) {
      const createdQuestion = await prisma.question.create({
        data: {
          testId: limitationsTest.id,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        },
      });

      console.log(`Created question ${question.questionNumber}`);

      // Create options for this question
      for (const option of question.options) {
        await prisma.option.create({
          data: {
            questionId: createdQuestion.id,
            label: option.label,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
          },
        });
      }

      console.log(`Created options for question ${question.questionNumber}`);
    }

    console.log('Boeing 737 MAX Limitations Test seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });