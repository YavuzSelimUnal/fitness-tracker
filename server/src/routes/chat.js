import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { buildRecentContext } from "../services/contextBuilder.js";
import { searchUsdaFoods } from "../services/usdaService.js";
import { calculateMealCalories, calculateCaloriesBurned } from "../services/calorieCalc.js";
import { parseUserMessage, parseMealImage, generateCoachReply } from "../services/claudeService.js";
import multer from "multer";

// Resolves one food item (name + grams) against the food cache/USDA,
// saves it as a meal entry, and returns a summary object for the reply.
// Shared between text-based and photo-based logging.
async function logMealItem(userId, food, quantityG) {
    let foodItem = await prisma.foodItem.findFirst({
      where: { name: { contains: food, mode: "insensitive" } },
    });
  
    if (!foodItem) {
      const results = await searchUsdaFoods(food);
      if (results[0]) {
        foodItem = await prisma.foodItem.create({
          data: {
            externalId: results[0].externalId,
            source: "usda",
            name: results[0].name,
            caloriesPer100g: results[0].caloriesPer100g,
            proteinPer100g: results[0].proteinPer100g,
            carbsPer100g: results[0].carbsPer100g,
            fatPer100g: results[0].fatPer100g,
          },
        });
      }
    }
  
    if (!foodItem) return null;
  
    const calories = calculateMealCalories({ caloriesPer100g: foodItem.caloriesPer100g, quantityG });
  
    await prisma.mealLog.create({
      data: {
        userId,
        entries: { create: [{ foodItemId: foodItem.id, quantityG, calories }] },
      },
    });
  
    return { type: "meal", food: foodItem.name, quantity_g: quantityG, calories };
  }

const router = Router();

// Store uploaded photos in memory temporarily (not saved to disk) —
// we only need them long enough to send to Claude's vision API.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/chat/history — load past messages so the chat UI can show them
router.get("/history", requireAuth, async (req, res) => {
  const messages = await prisma.chatMessage.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  res.json(messages);
});

// POST /api/chat — the main endpoint
// POST /api/chat/meal-photo — log a meal from a photo instead of text
router.post("/meal-photo", requireAuth, upload.single("photo"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No photo provided" });
    }
  
    try {
      const imageBase64 = req.file.buffer.toString("base64");
      const mediaType = req.file.mimetype; // e.g. "image/jpeg"
      const caption = req.body.caption || null;
  
      await prisma.chatMessage.create({
        data: { userId: req.userId, role: "user", content: caption || "[Sent a meal photo]" },
      });
  
      const toolCalls = await parseMealImage(imageBase64, mediaType, caption);
      const loggedItems = [];
  
      for (const call of toolCalls) {
        if (call.name === "log_meal") {
          for (const item of call.input.items) {
            const logged = await logMealItem(req.userId, item.food, item.quantity_g);
            if (logged) loggedItems.push(logged);
          }
        }
      }
  
      const recentContext = await buildRecentContext(req.userId);
      const replyText = await generateCoachReply({
        userMessage: caption || "I'm sending a photo of my meal.",
        recentContext,
        justLogged: loggedItems.length ? loggedItems : null,
      });
  
      await prisma.chatMessage.create({
        data: {
          userId: req.userId,
          role: "assistant",
          content: replyText,
          structuredData: loggedItems.length ? loggedItems : undefined,
        },
      });
  
      res.json({ reply: replyText, logged: loggedItems });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to process the photo" });
    }
  });

router.post("/", requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Save the user's message immediately
    await prisma.chatMessage.create({
      data: { userId: req.userId, role: "user", content: message },
    });

    // Step 1: ask Haiku to check if this message logs anything
    const toolCalls = await parseUserMessage(message);
    const loggedItems = [];

    for (const call of toolCalls) {
        if (call.name === "log_meal") {
            for (const item of call.input.items) {
              const logged = await logMealItem(req.userId, item.food, item.quantity_g);
              if (logged) loggedItems.push(logged);
            }
          }

      if (call.name === "log_workout") {
        const input = call.input;
        let exercise = await prisma.exercise.findFirst({
          where: { name: { contains: input.exercise, mode: "insensitive" } },
        });

        // Fallback: if we don't recognize the exercise, use a reasonable
        // general MET value rather than failing the whole log attempt.
        if (!exercise) {
          exercise = { metValue: input.duration_min ? 5.0 : 6.0, name: input.exercise };
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const caloriesBurned = calculateCaloriesBurned({
          metValue: exercise.metValue,
          weightKg: user.weightKg,
          durationMin: input.duration_min || 30, // rough default if not specified
        });

        // If it's a genuinely new exercise, save it so it's searchable later too
        let exerciseId = exercise.id;
        if (!exerciseId) {
          const created = await prisma.exercise.create({
            data: { name: input.exercise, category: "cardio", metValue: exercise.metValue, isCustom: true, createdById: req.userId },
          });
          exerciseId = created.id;
        }

        await prisma.workoutSession.create({
          data: {
            userId: req.userId,
            entries: {
              create: [{
                exerciseId,
                sets: input.sets,
                reps: input.reps,
                weightKg: input.weight_kg,
                durationMin: input.duration_min,
                caloriesBurned,
              }],
            },
          },
        });

        loggedItems.push({ type: "workout", exercise: input.exercise, caloriesBurned });
      }
    }

    // Step 2: build context and get Sonnet's coach reply
    const recentContext = await buildRecentContext(req.userId);
    const replyText = await generateCoachReply({
      userMessage: message,
      recentContext,
      justLogged: loggedItems.length ? loggedItems : null,
    });

    // Save the assistant's reply
    await prisma.chatMessage.create({
      data: {
        userId: req.userId,
        role: "assistant",
        content: replyText,
        structuredData: loggedItems.length ? loggedItems : undefined,
      },
    });

    res.json({ reply: replyText, logged: loggedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing your message" });
  }
});

export default router;