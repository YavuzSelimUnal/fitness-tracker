import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import exerciseRoutes from "./routes/exercises.js";
import workoutRoutes from "./routes/workouts.js";
import foodRoutes from "./routes/foods.js";
import mealRoutes from "./routes/meals.js";
import goalRoutes from "./routes/goals.js";
import weightRoutes from "./routes/weight.js";
import chatRoutes from "./routes/chat.js";
import savedMealRoutes from "./routes/savedMeals.js";
import helmet from "helmet";



const app = express();
app.use(helmet());

app.use(cors({ origin: true })); // reflects any origin — fine for local development/testing
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/weight", weightRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/saved-meals", savedMealRoutes);

// TODO: workouts, meals, foods, chat, dashboard routes
// (see /docs schema for the full planned API surface)

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
