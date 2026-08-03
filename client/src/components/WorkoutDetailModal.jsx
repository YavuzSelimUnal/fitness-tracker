import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import api from "../lib/api.js";

export default function WorkoutDetailModal({ entry, onClose, onUpdated, onDeleted }) {
  const [sets, setSets] = useState(entry.sets || "");
  const [reps, setReps] = useState(entry.reps || "");
  const [weightKg, setWeightKg] = useState(entry.weightKg || "");
  const [durationMin, setDurationMin] = useState(entry.durationMin || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.patch(`/workouts/entry/${entry.id}`, {
        sets: sets ? Number(sets) : null,
        reps: reps ? Number(reps) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        durationMin: durationMin ? Number(durationMin) : null,
      });
      onUpdated(res.data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await api.delete(`/workouts/entry/${entry.id}`);
    onDeleted(entry.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-bg-card border border-bg-border rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-medium">{entry.exercise.name}</h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Sets" value={sets} onChange={setSets} />
          <Field label="Reps" value={reps} onChange={setReps} />
          <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
          <Field label="Duration (min)" value={durationMin} onChange={setDurationMin} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent text-accent-dark py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Save changes
          </button>
          <button
            onClick={handleDelete}
            className="bg-bg border border-bg-border text-accent px-3 rounded-lg"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-text-muted text-xs block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-bg border border-bg-border text-text text-sm"
      />
    </div>
  );
}