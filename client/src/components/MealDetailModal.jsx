import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import api from "../lib/api.js";

export default function MealDetailModal({ entry, onClose, onUpdated, onDeleted }) {
  const [quantityG, setQuantityG] = useState(entry.quantityG);
  const [saving, setSaving] = useState(false);

  const food = entry.foodItem;
  // Recalculate the other macros live as quantity changes, so the preview
  // updates immediately without waiting for a server round-trip.
  const scale = quantityG / 100;
  const calories = Math.round(food.caloriesPer100g * scale);
  const protein = (food.proteinPer100g * scale).toFixed(1);
  const carbs = (food.carbsPer100g * scale).toFixed(1);
  const fat = (food.fatPer100g * scale).toFixed(1);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.patch(`/meals/entry/${entry.id}`, { quantityG: Number(quantityG) });
      onUpdated(res.data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await api.delete(`/meals/entry/${entry.id}`);
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
          <h2 className="font-medium">{food.name}</h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="Calories" value={`${calories} kcal`} />
          <Stat label="Protein" value={`${protein}g`} />
          <Stat label="Carbs" value={`${carbs}g`} />
          <Stat label="Fat" value={`${fat}g`} />
        </div>

        <label className="text-sm text-text-muted block mb-1">Quantity (grams)</label>
        <input
          type="number"
          value={quantityG}
          onChange={(e) => setQuantityG(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg border border-bg-border text-text mb-4"
        />

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

function Stat({ label, value }) {
  return (
    <div className="bg-bg rounded-lg p-3">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}