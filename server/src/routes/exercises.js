import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

// GET /api/exercises?search=running
router.get("/", requireAuth, async (req, res) => {
  const search = req.query.search?.toString() || "";
  const exercises = await prisma.exercise.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { name: "asc" },
    take: 50,
  });
  res.json(exercises);
});

const updateExerciseSchema = z.object({
  metValue: z.number().positive(),
});

// PATCH /api/exercises/:id — only allowed on exercises the user created themselves
router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateExerciseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const exercise = await prisma.exercise.findUnique({ where: { id: req.params.id } });

  if (!exercise) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  // Important: only let users edit exercises they personally created via
  // chat — never the shared, curated MET-value list everyone relies on.
  if (!exercise.isCustom || exercise.createdById !== req.userId) {
    return res.status(403).json({ error: "You can only edit exercises you created" });
  }

  const updated = await prisma.exercise.update({
    where: { id: req.params.id },
    data: { metValue: parsed.data.metValue },
  });

  res.json(updated);
});

export default router;