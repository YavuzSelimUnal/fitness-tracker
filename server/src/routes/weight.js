import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

const logWeightSchema = z.object({
  weightKg: z.number().positive(),
});

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
    const parsed = logWeightSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { weightKg } = parsed.data;

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