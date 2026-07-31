import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateMealCalories } from "../services/calorieCalc.js";

const router = Router();

// GET /api/meals — fetch this user's meal history
router.get("/", requireAuth, async (req, res) => {
  const logs = await prisma.mealLog.findMany({
    where: { userId: req.userId },
    include: { entries: { include: { foodItem: true } } },
    orderBy: { date: "desc" },
  });
  res.json(logs);
});

// POST /api/meals — log a food entry
router.post("/", requireAuth, async (req, res) => {
  const { foodItemId, quantityG, mealType } = req.body;

  const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
  if (!foodItem) {
    return res.status(400).json({ error: "Food item not found" });
  }

  const calories = calculateMealCalories({
    caloriesPer100g: foodItem.caloriesPer100g,
    quantityG,
  });

  const mealLog = await prisma.mealLog.create({
    data: {
      userId: req.userId,
      mealType: mealType || null,
      entries: {
        create: [{ foodItemId, quantityG, calories }],
      },
    },
    include: { entries: true },
  });

  res.status(201).json(mealLog);
});

export default router;