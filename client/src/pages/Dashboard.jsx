import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../lib/api.js";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/workouts"), api.get("/meals")])
      .then(([workoutsRes, mealsRes]) => {
        setSessions(workoutsRes.data);
        setMeals(mealsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todaysSessions = sessions.filter(
    (s) => new Date(s.date).toDateString() === today
  );
  const todaysMeals = meals.filter(
    (m) => new Date(m.date).toDateString() === today
  );

  return (
    <div className="min-h-screen bg-bg text-text p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>
        <button onClick={logout} className="text-sm text-text-muted hover:text-text">
          Log out
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <Link
          to="/log-workout"
          className="inline-block bg-accent text-accent-dark px-4 py-2 rounded-lg font-medium"
        >
          + Log workout
        </Link>
        <Link
          to="/log-meal"
          className="inline-block bg-bg-card border border-bg-border text-text px-4 py-2 rounded-lg font-medium"
        >
          + Log meal
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <h2 className="font-medium mb-3">Today's workout</h2>
          {loading ? (
            <p className="text-text-muted text-sm">Loading…</p>
          ) : todaysSessions.length === 0 ? (
            <p className="text-text-muted text-sm">Not logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {todaysSessions.flatMap((session) =>
                session.entries.map((entry) => (
                  <li key={entry.id} className="text-sm flex justify-between">
                    <span>{entry.exercise.name}</span>
                    <span className="text-text-muted">
                      {entry.sets && entry.reps
                        ? `${entry.sets}x${entry.reps} @ ${entry.weightKg || 0}kg`
                        : entry.durationMin
                        ? `${entry.durationMin} min`
                        : ""}
                      {entry.caloriesBurned ? ` · ${entry.caloriesBurned} kcal` : ""}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <h2 className="font-medium mb-3">Today's meals</h2>
          {loading ? (
            <p className="text-text-muted text-sm">Loading…</p>
          ) : todaysMeals.length === 0 ? (
            <p className="text-text-muted text-sm">Not logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {todaysMeals.flatMap((meal) =>
                meal.entries.map((entry) => (
                  <li key={entry.id} className="text-sm flex justify-between">
                    <span>{entry.foodItem.name}</span>
                    <span className="text-text-muted">
                      {entry.quantityG}g · {Math.round(entry.calories)} kcal
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}