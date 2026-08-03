import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../lib/api.js";

export default function Goals() {
  const [goal, setGoal] = useState(null);
  const [editing, setEditing] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState("");
  const [workoutCountTarget, setWorkoutCountTarget] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [meals, setMeals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [range, setRange] = useState(7); // 7 = week, 30 = month
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/goals/current"), api.get("/meals"), api.get("/workouts")])
      .then(([g, m, w]) => {
        setGoal(g.data);
        setMeals(m.data);
        setSessions(w.data);
        if (g.data) {
          setCalorieTarget(g.data.calorieTarget || "");
          setWorkoutCountTarget(g.data.workoutCountTarget || "");
          setTargetWeightKg(g.data.targetWeightKg || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    const res = await api.post("/goals", {
      periodType: "weekly",
      calorieTarget,
      workoutCountTarget,
      targetWeightKg,
    });
    setGoal(res.data);
    setEditing(false);
  }

  // Build one data point per day for the last `range` days, e.g.
  // [{ label: "Mon", calories: 1800, workouts: 1 }, ...]
  const chartData = Array.from({ length: range }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (range - 1 - i));
    const dateString = d.toDateString();

    const dayMeals = meals.filter((m) => new Date(m.date).toDateString() === dateString);
    const calories = dayMeals
      .flatMap((m) => m.entries)
      .reduce((sum, e) => sum + (e.calories || 0), 0);

    const workouts = sessions.filter((s) => new Date(s.date).toDateString() === dateString).length;

    return {
      label: d.toLocaleDateString(undefined, range === 7 ? { weekday: "short" } : { day: "numeric" }),
      calories: Math.round(calories),
      workouts,
    };
  });

  if (loading) {
    return <p className="text-text-muted text-sm">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Progress</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setRange(7)}
          className={`px-3 py-1.5 rounded-lg text-sm ${range === 7 ? "bg-accent text-accent-dark" : "bg-bg-card border border-bg-border text-text-muted"}`}
        >
          Week
        </button>
        <button
          onClick={() => setRange(30)}
          className={`px-3 py-1.5 rounded-lg text-sm ${range === 30 ? "bg-accent text-accent-dark" : "bg-bg-card border border-bg-border text-text-muted"}`}
        >
          Month
        </button>
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-4">
        <p className="text-sm mb-3">Calories per day</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#2a2b2e" vertical={false} />
            <XAxis dataKey="label" stroke="#8a8a8d" fontSize={11} />
            <YAxis stroke="#8a8a8d" fontSize={11} width={35} />
            <Tooltip contentStyle={{ background: "#19191b", border: "1px solid #2a2b2e", fontSize: 12 }} />
            <Line type="monotone" dataKey="calories" stroke="#e8543a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-6">
        <p className="text-sm mb-3">Workouts per day</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#2a2b2e" vertical={false} />
            <XAxis dataKey="label" stroke="#8a8a8d" fontSize={11} />
            <YAxis stroke="#8a8a8d" fontSize={11} width={25} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#19191b", border: "1px solid #2a2b2e", fontSize: 12 }} />
            <Bar dataKey="workouts" fill="#e8543a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="font-medium mb-3">Goals</p>
      {!goal || editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-text-muted block mb-1">Daily calorie target</label>
            <input
              type="number" value={calorieTarget} onChange={(e) => setCalorieTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
              placeholder="e.g. 2000"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">Workouts this week</label>
            <input
              type="number" value={workoutCountTarget} onChange={(e) => setWorkoutCountTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">Target weight (kg)</label>
            <input
              type="number" value={targetWeightKg} onChange={(e) => setTargetWeightKg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
              placeholder="e.g. 75"
            />
          </div>
          <button type="submit" className="w-full bg-accent text-accent-dark py-2 rounded-lg font-medium">
            Save goals
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="bg-bg-card border border-bg-border rounded-xl p-4">
            <p className="text-sm text-text-muted">Daily calorie target</p>
            <p className="text-lg">{goal.calorieTarget || "—"} kcal</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-4">
            <p className="text-sm text-text-muted">Workouts this week</p>
            <p className="text-lg">{goal.workoutCountTarget || "—"}</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-4">
            <p className="text-sm text-text-muted">Target weight</p>
            <p className="text-lg">{goal.targetWeightKg || "—"} kg</p>
          </div>
          <button onClick={() => setEditing(true)} className="w-full border border-bg-border text-accent py-2 rounded-lg font-medium">
            Edit goals
          </button>
        </div>
      )}
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