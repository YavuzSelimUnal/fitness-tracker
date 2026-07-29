import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateCaloriesBurned } from "../services/calorieCalc.js";

const router = Router();

// GET /api/workouts — fetch this user's workout history
router.get("/", requireAuth, async (req, res) => {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: req.userId },
    include: { entries: { include: { exercise: true } } },
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

// POST /api/workouts — log a new workout
router.post("/", requireAuth, async (req, res) => {
  const { exerciseId, sets, reps, weightKg, durationMin, distanceKm } = req.body;

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) {
    return res.status(400).json({ error: "Exercise not found" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  const caloriesBurned = calculateCaloriesBurned({
    metValue: exercise.metValue,
    weightKg: user.weightKg,
    durationMin,
  });

  const session = await prisma.workoutSession.create({
    data: {
      userId: req.userId,
      entries: {
        create: [{ exerciseId, sets, reps, weightKg, durationMin, distanceKm, caloriesBurned }],
      },
    },
    include: { entries: true },
  });

  res.status(201).json(session);
});

export default router;