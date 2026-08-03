import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateCaloriesBurned } from "../services/calorieCalc.js";
import { z } from "zod";

const logWorkoutSchema = z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
    weightKg: z.number().positive().optional(),
    durationMin: z.number().positive().optional(),
    distanceKm: z.number().positive().optional(),
  });

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
    const parsed = logWorkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { exerciseId, sets, reps, weightKg, durationMin, distanceKm } = parsed.data;

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

// PATCH /api/workouts/entry/:id — edit a single workout entry
router.patch("/entry/:id", requireAuth, async (req, res) => {
    const { sets, reps, weightKg, durationMin } = req.body;
  
    const entry = await prisma.workoutEntry.findUnique({
      where: { id: req.params.id },
      include: { session: true, exercise: true },
    });
  
    if (!entry || entry.session.userId !== req.userId) {
      return res.status(404).json({ error: "Workout entry not found" });
    }
  
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const caloriesBurned = calculateCaloriesBurned({
      metValue: entry.exercise.metValue,
      weightKg: user.weightKg,
      durationMin: durationMin ?? entry.durationMin,
    });
  
    const updated = await prisma.workoutEntry.update({
      where: { id: req.params.id },
      data: { sets, reps, weightKg, durationMin, caloriesBurned },
      include: { exercise: true },
    });
  
    res.json(updated);
  });
  
  // DELETE /api/workouts/entry/:id — remove a single workout entry
  router.delete("/entry/:id", requireAuth, async (req, res) => {
    const entry = await prisma.workoutEntry.findUnique({
      where: { id: req.params.id },
      include: { session: true },
    });
  
    if (!entry || entry.session.userId !== req.userId) {
      return res.status(404).json({ error: "Workout entry not found" });
    }
  
    await prisma.workoutEntry.delete({ where: { id: req.params.id } });
    res.status(204).send();
  });


export default router;