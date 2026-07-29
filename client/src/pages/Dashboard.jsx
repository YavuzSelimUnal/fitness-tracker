import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../lib/api.js";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/workouts")
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Only show sessions logged today
  const today = new Date().toDateString();
  const todaysSessions = sessions.filter(
    (s) => new Date(s.date).toDateString() === today
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

      <Link
        to="/log-workout"
        className="inline-block bg-accent text-accent-dark px-4 py-2 rounded-lg font-medium mb-8"
      >
        + Log workout
      </Link>

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
          <h2 className="font-medium mb-2">Today's meals</h2>
          <p className="text-text-muted text-sm">Not logged yet.</p>
        </div>
      </div>
    </div>
  );
}