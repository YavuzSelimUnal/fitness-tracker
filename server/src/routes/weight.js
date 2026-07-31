import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/weight — full weight history for this user, oldest first
router.get("/", requireAuth, async (req, res) => {
  const logs = await prisma.weightLog.findMany({
    where: { userId: req.userId },
    orderBy: { loggedAt: "asc" },
  });
  res.json(logs);
});

// POST /api/weight — log today's weight, and update the user's current weight
// (their profile weight is what the calorie-burn calculation uses, so we
// keep it in sync automatically whenever a new weight is logged)
router.post("/", requireAuth, async (req, res) => {
  const { weightKg } = req.body;
  if (!weightKg) {
    return res.status(400).json({ error: "weightKg is required" });
  }

  const [log] = await prisma.$transaction([
    prisma.weightLog.create({
      data: { userId: req.userId, weightKg: Number(weightKg) },
    }),
    prisma.user.update({
      where: { id: req.userId },
      data: { weightKg: Number(weightKg) },
    }),
  ]);

  res.status(201).json(log);
});

export default router;