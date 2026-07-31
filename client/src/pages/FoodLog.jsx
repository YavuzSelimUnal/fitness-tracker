import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

export default function FoodLog() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/meals").then((res) => setMeals(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Food Log</h1>
        <Link to="/log-meal" className="text-accent text-sm font-medium">
          + Add
        </Link>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : meals.length === 0 ? (
        <p className="text-text-muted text-sm">No meals logged yet.</p>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-bg-card border border-bg-border rounded-2xl p-4">
              <p className="text-text-muted text-xs mb-2">
                {new Date(meal.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {meal.entries.map((entry) => (
                <div key={entry.id} className="flex justify-between text-sm py-1">
                  <span>{entry.foodItem.name}</span>
                  <span className="text-text-muted">
                    {entry.quantityG}g · {Math.round(entry.calories)} kcal
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}