import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

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

export default router;
