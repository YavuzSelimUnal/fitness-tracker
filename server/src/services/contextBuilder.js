import prisma from "../lib/prisma.js";

// Builds a plain-text summary of the user's last 7 days — this gets fed
// to Sonnet so it can give genuinely personalized coaching, not generic advice.
export async function buildRecentContext(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [meals, sessions, goal, user] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      include: { entries: { include: { foodItem: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.workoutSession.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      include: { entries: { include: { exercise: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findFirst({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  const mealLines = meals.flatMap((m) =>
    m.entries.map(
      (e) => `${new Date(m.date).toDateString()}: ${e.foodItem.name} (${Math.round(e.calories)} kcal)`
    )
  );

  const workoutLines = sessions.flatMap((s) =>
    s.entries.map((e) => {
      const detail = e.sets
        ? `${e.sets}x${e.reps} @ ${e.weightKg || 0}kg`
        : `${e.durationMin} min`;
      return `${new Date(s.date).toDateString()}: ${e.exercise.name} - ${detail}${
        e.caloriesBurned ? ` (${e.caloriesBurned} kcal burned)` : ""
      }`;
    })
  );

  return `
User's current weight: ${user.weightKg || "not set"} kg
Goals: ${goal ? `${goal.calorieTarget || "no"} kcal/day target, ${goal.workoutCountTarget || "no"} workouts/week target, ${goal.targetWeightKg || "no"} kg target weight` : "none set"}

Meals logged this week:
${mealLines.length ? mealLines.join("\n") : "none logged"}

Workouts logged this week:
${workoutLines.length ? workoutLines.join("\n") : "none logged"}
  `.trim();
}