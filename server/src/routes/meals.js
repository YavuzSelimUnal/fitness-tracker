import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateMealCalories } from "../services/calorieCalc.js";
import { z } from "zod";

const logMealSchema = z.object({
    foodItemId: z.string().uuid(),
    quantityG: z.number().positive(),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  });

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
    const parsed = logMealSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { foodItemId, quantityG, mealType } = parsed.data;

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

// PATCH /api/meals/entry/:id — edit a single meal entry's quantity
router.patch("/entry/:id", requireAuth, async (req, res) => {
    const { quantityG } = req.body;
  
    const entry = await prisma.mealEntry.findUnique({
      where: { id: req.params.id },
      include: { mealLog: true, foodItem: true },
    });
  
    if (!entry || entry.mealLog.userId !== req.userId) {
      return res.status(404).json({ error: "Meal entry not found" });
    }
  
    const calories = calculateMealCalories({
      caloriesPer100g: entry.foodItem.caloriesPer100g,
      quantityG,
    });
  
    const updated = await prisma.mealEntry.update({
      where: { id: req.params.id },
      data: { quantityG, calories },
      include: { foodItem: true },
    });
  
    res.json(updated);
  });
  
  // DELETE /api/meals/entry/:id — remove a single meal entry
  router.delete("/entry/:id", requireAuth, async (req, res) => {
    const entry = await prisma.mealEntry.findUnique({
      where: { id: req.params.id },
      include: { mealLog: true },
    });
  
    if (!entry || entry.mealLog.userId !== req.userId) {
      return res.status(404).json({ error: "Meal entry not found" });
    }
  
    await prisma.mealEntry.delete({ where: { id: req.params.id } });
    res.status(204).send();
  });

export default router;