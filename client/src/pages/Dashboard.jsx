import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import MealDetailModal from "../components/MealDetailModal.jsx";
import WorkoutDetailModal from "../components/WorkoutDetailModal.jsx";

export default function Dashboard() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [meals, setMeals] = useState([]);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealEntry, setSelectedMealEntry] = useState(null);
  const [selectedWorkoutEntry, setSelectedWorkoutEntry] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/workouts"), api.get("/meals"), api.get("/goals/current")])
      .then(([w, m, g]) => {
        setSessions(w.data);
        setMeals(m.data);
        setGoal(g.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedDateString = selectedDate.toDateString();
  const isToday = selectedDateString === new Date().toDateString();

  function goToPreviousDay() {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  }

  function goToNextDay() {
    if (isToday) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  }

  const daysMeals = meals.filter((m) => new Date(m.date).toDateString() === selectedDateString);
  const daysEntries = daysMeals.flatMap((m) => m.entries.map((e) => ({ ...e, mealLogId: m.id })));
  const daysSessions = sessions.filter((s) => new Date(s.date).toDateString() === selectedDateString);
  const daysWorkoutEntries = daysSessions.flatMap((s) => s.entries);

  const consumed = daysEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const protein = daysEntries.reduce((sum, e) => sum + (e.foodItem?.proteinPer100g || 0) * (e.quantityG / 100), 0);
  const carbs = daysEntries.reduce((sum, e) => sum + (e.foodItem?.carbsPer100g || 0) * (e.quantityG / 100), 0);
  const fat = daysEntries.reduce((sum, e) => sum + (e.foodItem?.fatPer100g || 0) * (e.quantityG / 100), 0);

  const calorieTarget = goal?.calorieTarget || 2000;
  const remaining = Math.max(0, calorieTarget - consumed);
  const percentFilled = Math.min(100, (consumed / calorieTarget) * 100);
  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference - (percentFilled / 100) * circumference;

  // Updates local state after editing a meal entry, without re-fetching everything
  function handleMealUpdated(updatedEntry) {
    setMeals((prev) =>
      prev.map((m) => ({
        ...m,
        entries: m.entries.map((e) => (e.id === updatedEntry.id ? { ...e, ...updatedEntry } : e)),
      }))
    );
  }

  function handleMealDeleted(entryId) {
    setMeals((prev) =>
      prev.map((m) => ({ ...m, entries: m.entries.filter((e) => e.id !== entryId) }))
    );
  }

  function handleWorkoutUpdated(updatedEntry) {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === updatedEntry.id ? { ...e, ...updatedEntry } : e)),
      }))
    );
  }

  function handleWorkoutDeleted(entryId) {
    setSessions((prev) =>
      prev.map((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== entryId) }))
    );
  }

  if (loading) {
    return <div className="text-text-muted">Loading…</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousDay} className="text-text-muted hover:text-text">
              <ChevronLeft size={18} />
            </button>
            <p className="text-text-muted text-xs uppercase tracking-wide">
              {isToday
                ? "Today"
                : selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <button
              onClick={goToNextDay}
              disabled={isToday}
              className={isToday ? "text-bg-border" : "text-text-muted hover:text-text"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <button onClick={logout} className="text-sm text-text-muted hover:text-text">
          Log out
        </button>
      </div>

      <Link
        to="/chat"
        className="flex items-center gap-3 bg-bg-card border border-bg-border rounded-2xl p-4 mb-6"
      >
        <div className="bg-accent/10 p-2.5 rounded-full">
          <MessageCircle className="text-accent" size={18} />
        </div>
        <div>
          <p className="text-sm font-medium">Talk to your coach</p>
          <p className="text-text-muted text-xs">Log naturally or ask for advice</p>
        </div>
      </Link>

      <p className="font-medium mb-4">Daily nutrition</p>

      <div className="flex items-center justify-center gap-5 mb-6">
        <div className="text-center">
          <p className="text-lg font-semibold">{remaining}</p>
          <p className="text-text-muted text-xs">Remaining</p>
        </div>
        <svg width="130" height="130" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2b2e" strokeWidth="9" />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke="#e8543a" strokeWidth="9"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="56" textAnchor="middle" fill="#f4f4f5" fontSize="22" fontWeight="600">
            {Math.round(consumed)}
          </text>
          <text x="60" y="74" textAnchor="middle" fill="#8a8a8d" fontSize="10">Consumed</text>
        </svg>
        <div className="text-center">
          <p className="text-lg font-semibold">{calorieTarget}</p>
          <p className="text-text-muted text-xs">Target</p>
        </div>
      </div>

      <div className="flex justify-between gap-3 mb-6">
        <MacroBar label="Protein" value={protein} color="#e8543a" />
        <MacroBar label="Fat" value={fat} color="#e8a53a" />
        <MacroBar label="Carbs" value={carbs} color="#4fbf7a" />
      </div>

      {daysWorkoutEntries.length > 0 && (
        <div className="mb-6">
          <p className="font-medium mb-3">Workouts</p>
          <div className="bg-bg-card border border-bg-border rounded-2xl p-2">
            {daysWorkoutEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedWorkoutEntry(entry)}
                className="w-full flex justify-between text-sm p-3 rounded-xl hover:bg-bg text-left"
              >
                <span>{entry.exercise.name}</span>
                <span className="text-text-muted">
                  {entry.sets && entry.reps
                    ? `${entry.sets}x${entry.reps} @ ${entry.weightKg || 0}kg`
                    : entry.durationMin
                    ? `${entry.durationMin} min`
                    : ""}
                  {entry.caloriesBurned ? ` · ${entry.caloriesBurned} kcal` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {daysEntries.length > 0 && (
        <div className="mb-6">
          <p className="font-medium mb-3">Meals</p>
          <div className="bg-bg-card border border-bg-border rounded-2xl p-2">
            {daysEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedMealEntry(entry)}
                className="w-full flex justify-between text-sm p-3 rounded-xl hover:bg-bg text-left"
              >
                <span>{entry.foodItem.name}</span>
                <span className="text-text-muted">
                  {entry.quantityG}g · {Math.round(entry.calories)} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}


      {selectedMealEntry && (
        <MealDetailModal
          entry={selectedMealEntry}
          onClose={() => setSelectedMealEntry(null)}
          onUpdated={handleMealUpdated}
          onDeleted={handleMealDeleted}
        />
      )}

      {selectedWorkoutEntry && (
        <WorkoutDetailModal
          entry={selectedWorkoutEntry}
          onClose={() => setSelectedWorkoutEntry(null)}
          onUpdated={handleWorkoutUpdated}
          onDeleted={handleWorkoutDeleted}
        />
      )}
    </div>
  );
}

function MacroBar({ label, value, color }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <div className="bg-bg-border rounded h-1.5 mb-1">
        <div className="rounded h-1.5" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-text-muted">{Math.round(value)}g</p>
    </div>
  );
}