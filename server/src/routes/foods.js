import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { searchUsdaFoods } from "../services/usdaService.js";

const router = Router();

// GET /api/foods/search?q=chicken breast
router.get("/search", requireAuth, async (req, res) => {
  const query = req.query.q?.toString();
  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    // 1. Check our own cache first
    const cached = await prisma.foodItem.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 10,
    });

    if (cached.length > 0) {
      return res.json(cached);
    }

    // 2. Not cached — ask USDA directly
    const results = await searchUsdaFoods(query);

    // 3. Save each result into our cache table for next time.
    // We check "does this externalId already exist?" first, since we don't
    // yet have a database-level unique constraint to upsert against.
    const saved = [];
    for (const food of results) {
      let item = await prisma.foodItem.findFirst({
        where: { externalId: food.externalId, source: "usda" },
      });
      if (!item) {
        item = await prisma.foodItem.create({
          data: {
            externalId: food.externalId,
            source: "usda",
            name: food.name,
            caloriesPer100g: food.caloriesPer100g,
            proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g,
            fatPer100g: food.fatPer100g,
          },
        });
      }
      saved.push(item);
    }

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search foods" });
  }
});

export default router;