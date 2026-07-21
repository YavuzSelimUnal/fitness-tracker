import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// MET (Metabolic Equivalent of Task) values sourced from the
// Compendium of Physical Activities (Ainsworth et al.) — the standard
// reference used across exercise science and most fitness apps.
// calories_burned = MET * weight_kg * duration_hours
const exercises = [
  { name: "Running (moderate, ~9:30/mi)", category: "cardio", metValue: 9.8 },
  { name: "Running (fast, ~7:30/mi)", category: "cardio", metValue: 11.8 },
  { name: "Walking (brisk)", category: "cardio", metValue: 4.3 },
  { name: "Cycling (moderate)", category: "cardio", metValue: 8.0 },
  { name: "Cycling (vigorous)", category: "cardio", metValue: 10.0 },
  { name: "Swimming (moderate)", category: "cardio", metValue: 8.3 },
  { name: "Rowing machine (moderate)", category: "cardio", metValue: 7.0 },
  { name: "Jump rope", category: "cardio", metValue: 11.0 },
  { name: "Elliptical trainer", category: "cardio", metValue: 5.0 },
  { name: "Stair climbing", category: "cardio", metValue: 8.8 },
  { name: "Bench Press", category: "strength", metValue: 6.0 },
  { name: "Squat", category: "strength", metValue: 6.0 },
  { name: "Deadlift", category: "strength", metValue: 6.0 },
  { name: "Overhead Press", category: "strength", metValue: 6.0 },
  { name: "Pull-up / Chin-up", category: "strength", metValue: 6.0 },
  { name: "Barbell Row", category: "strength", metValue: 6.0 },
  { name: "Lunges", category: "strength", metValue: 5.0 },
  { name: "Weight training (general, vigorous)", category: "strength", metValue: 6.0 },
  { name: "Weight training (general, light-moderate)", category: "strength", metValue: 3.5 },
  { name: "Yoga", category: "mobility", metValue: 2.5 },
  { name: "Stretching", category: "mobility", metValue: 2.3 },
];

async function main() {
  for (const ex of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, isCustom: false },
    });
    if (!existing) {
      await prisma.exercise.create({ data: { ...ex, isCustom: false } });
    }
  }
  console.log(`Seeded ${exercises.length} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
