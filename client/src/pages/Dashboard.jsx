import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/api.js";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function Dashboard() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [meals, setMeals] = useState([]);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    if (isToday) return; // can't go into the future
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  }

  const daysMeals = meals.filter((m) => new Date(m.date).toDateString() === selectedDateString);
  const daysEntries = daysMeals.flatMap((m) => m.entries);
  const daysSessions = sessions.filter((s) => new Date(s.date).toDateString() === selectedDateString);

  const consumed = daysEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const protein = daysEntries.reduce(
    (sum, e) => sum + (e.foodItem?.proteinPer100g || 0) * (e.quantityG / 100),
    0
  );
  const carbs = daysEntries.reduce(
    (sum, e) => sum + (e.foodItem?.carbsPer100g || 0) * (e.quantityG / 100),
    0
  );
  const fat = daysEntries.reduce(
    (sum, e) => sum + (e.foodItem?.fatPer100g || 0) * (e.quantityG / 100),
    0
  );

  const calorieTarget = goal?.calorieTarget || 2000;
  const remaining = Math.max(0, calorieTarget - consumed);
  const percentFilled = Math.min(100, (consumed / calorieTarget) * 100);
  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference - (percentFilled / 100) * circumference;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const workoutDays = new Set(sessions.map((s) => new Date(s.date).toDateString()));
  const mealDays = new Set(meals.map((m) => new Date(m.date).toDateString()));

  if (loading) {
    return <div className="min-h-screen bg-bg text-text-muted p-6">Loading…</div>;
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

      {daysSessions.length > 0 && (
        <div className="mb-6">
          <p className="font-medium mb-3">Workouts</p>
          <div className="bg-bg-card border border-bg-border rounded-2xl p-4 space-y-2">
            {daysSessions.flatMap((session) =>
              session.entries.map((entry) => (
                <div key={entry.id} className="flex justify-between text-sm">
                  <span>{entry.exercise.name}</span>
                  <span className="text-text-muted">
                    {entry.sets && entry.reps
                      ? `${entry.sets}x${entry.reps} @ ${entry.weightKg || 0}kg`
                      : entry.durationMin
                      ? `${entry.durationMin} min`
                      : ""}
                    {entry.caloriesBurned ? ` · ${entry.caloriesBurned} kcal` : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <p className="font-medium mb-3">Habits</p>
      <div className="flex gap-3">
        <HabitCard title="Workouts" activeDays={workoutDays} last7Days={last7Days} />
        <HabitCard title="Food logging" activeDays={mealDays} last7Days={last7Days} />
      </div>
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

function HabitCard({ title, activeDays, last7Days }) {
  const count = last7Days.filter((d) => activeDays.has(d)).length;
  return (
    <div className="flex-1 bg-bg-card border border-bg-border rounded-2xl p-4">
      <p className="text-sm mb-1">{title}</p>
      <p className="text-text-muted text-[10px] mb-3">Last 7 days</p>
      <div className="grid grid-cols-7 gap-1 mb-3">
        {last7Days.map((day) => (
          <div key={day} className="h-4 rounded-sm" style={{ backgroundColor: activeDays.has(day) ? "#e8543a" : "#2a2b2e" }} />
        ))}
      </div>
      <p className="text-xs">{count}/7 this week</p>
    </div>
  );
}