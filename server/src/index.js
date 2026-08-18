import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import exerciseRoutes from "./routes/exercises.js";
import workoutRoutes from "./routes/workouts.js";
import foodRoutes from "./routes/foods.js";
import mealRoutes from "./routes/meals.js";
import goalRoutes from "./routes/goals.js";
import weightRoutes from "./routes/weight.js";
import chatRoutes from "./routes/chat.js";
import savedMealRoutes from "./routes/savedMeals.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
app.use(helmet());
// Allow your deployed frontend always, plus localhost during local development
const allowedOrigins = [
  "https://fitness-tracker-three-zeta-73.vercel.app",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  maxAge: 600,
}));
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
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});