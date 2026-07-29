import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";

export default function LogWorkout() {
  const [exercises, setExercises] = useState([]);
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Runs once when the page loads — fetches the exercise list
  // from the backend so the dropdown has real options.
  useEffect(() => {
    api.get("/exercises").then((res) => setExercises(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workouts", {
        exerciseId,
        sets: sets ? Number(sets) : undefined,
        reps: reps ? Number(reps) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        durationMin: durationMin ? Number(durationMin) : undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6">
      <h1 className="text-xl font-medium mb-6">Log a workout</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {error && <p className="text-accent text-sm">{error}</p>}

        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
          required
        >
          <option value="">Select exercise…</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Sets"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
          />
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
          />
          <input
            type="number"
            placeholder="Duration (min)"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            className="px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-accent-dark py-2 rounded-lg font-medium"
        >
          Save workout
        </button>
      </form>
    </div>
  );
}