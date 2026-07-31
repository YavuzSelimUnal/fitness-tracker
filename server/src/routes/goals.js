import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/goals/current — the most recent goal set (used by the dashboard/goals page)
router.get("/current", requireAuth, async (req, res) => {
  const goal = await prisma.goal.findFirst({
    where: { userId: req.userId },
    orderBy: { startDate: "desc" },
  });
  res.json(goal); // null if the user hasn't set one yet — the frontend handles that
});

// POST /api/goals — create a new goal (or replace the current one)
router.post("/", requireAuth, async (req, res) => {
  const { periodType, calorieTarget, workoutCountTarget, targetWeightKg } = req.body;

  const goal = await prisma.goal.create({
    data: {
      userId: req.userId,
      periodType: periodType || "weekly",
      startDate: new Date(),
      calorieTarget: calorieTarget ? Number(calorieTarget) : null,
      workoutCountTarget: workoutCountTarget ? Number(workoutCountTarget) : null,
      targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
    },
  });

  res.status(201).json(goal);
});

export default router;