import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { lookupBarcode } from "../services/barcodeService.js";

const router = Router();

// GET /api/barcode/:code — look up a scanned barcode, checking our own
// cache first before hitting Open Food Facts
router.get("/:code", requireAuth, async (req, res) => {
  const { code } = req.params;

  try {
    let foodItem = await prisma.foodItem.findFirst({
      where: { externalId: code, source: "openfoodfacts" },
    });

    if (!foodItem) {
      const result = await lookupBarcode(code);

      if (!result) {
        return res.status(404).json({ error: "Product not found. Try searching manually instead." });
      }

      foodItem = await prisma.foodItem.create({
        data: {
          externalId: result.externalId,
          source: "openfoodfacts",
          name: result.name,
          caloriesPer100g: result.caloriesPer100g,
          proteinPer100g: result.proteinPer100g,
          carbsPer100g: result.carbsPer100g,
          fatPer100g: result.fatPer100g,
        },
      });
    }

    res.json(foodItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to look up barcode" });
  }
});

export default router;