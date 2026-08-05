import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateMealCalories } from "../services/calorieCalc.js";

const router = Router();

const saveMealSchema = z.object({
  name: z.string().min(1),
  items: z.array(
    z.object({
      foodItemId: z.string().uuid(),
      quantityG: z.number().positive(),
    })
  ).min(1),
});

// GET /api/saved-meals — list this user's saved meal combos
router.get("/", requireAuth, async (req, res) => {
  const savedMeals = await prisma.savedMeal.findMany({
    where: { userId: req.userId },
    include: { items: { include: { foodItem: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(savedMeals);
});

// POST /api/saved-meals — save a new combo (e.g. "My usual breakfast")
router.post("/", requireAuth, async (req, res) => {
  const parsed = saveMealSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { name, items } = parsed.data;

  const savedMeal = await prisma.savedMeal.create({
    data: {
      userId: req.userId,
      name,
      items: { create: items },
    },
    include: { items: { include: { foodItem: true } } },
  });

  res.status(201).json(savedMeal);
});

// POST /api/saved-meals/:id/log — log a saved combo as a real meal entry today
router.post("/:id/log", requireAuth, async (req, res) => {
  const savedMeal = await prisma.savedMeal.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { foodItem: true } } },
  });

  if (!savedMeal || savedMeal.userId !== req.userId) {
    return res.status(404).json({ error: "Saved meal not found" });
  }

  const mealLog = await prisma.mealLog.create({
    data: {
      userId: req.userId,
      entries: {
        create: savedMeal.items.map((item) => ({
          foodItemId: item.foodItemId,
          quantityG: item.quantityG,
          calories: calculateMealCalories({
            caloriesPer100g: item.foodItem.caloriesPer100g,
            quantityG: item.quantityG,
          }),
        })),
      },
    },
    include: { entries: { include: { foodItem: true } } },
  });

  res.status(201).json(mealLog);
});

// DELETE /api/saved-meals/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const savedMeal = await prisma.savedMeal.findUnique({ where: { id: req.params.id } });
  if (!savedMeal || savedMeal.userId !== req.userId) {
    return res.status(404).json({ error: "Saved meal not found" });
  }
  await prisma.savedMeal.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;