import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// One combined endpoint for everything the Dashboard needs, instead of
// three separate requests each paying their own connection overhead.
router.get("/", requireAuth, async (req, res) => {
  const [sessions, meals, goal] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: req.userId },
      include: { entries: { include: { exercise: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.mealLog.findMany({
      where: { userId: req.userId },
      include: { entries: { include: { foodItem: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findFirst({ where: { userId: req.userId }, orderBy: { startDate: "desc" } }),
  ]);

  res.json({ sessions, meals, goal });
});

export default router;