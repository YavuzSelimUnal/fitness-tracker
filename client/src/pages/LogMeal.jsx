import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";

export default function LogMeal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantityG, setQuantityG] = useState("100");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setSelectedFood(null);
    try {
      const res = await api.get("/foods/search", { params: { q: query } });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Search failed");
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/meals", {
        foodItemId: selectedFood.id,
        quantityG: Number(quantityG),
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  // Live preview of calories for the entered quantity, calculated
  // the same way the backend will calculate it for real.
  const previewCalories = selectedFood
    ? Math.round((Number(quantityG) / 100) * selectedFood.caloriesPer100g)
    : null;

  return (
    <div className="min-h-screen bg-bg text-text p-6">
      <h1 className="text-xl font-medium mb-6">Log a meal</h1>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mb-4">
        <input
          type="text"
          placeholder="Search a food, e.g. chicken breast"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
        >
          Search
        </button>
      </form>

      {error && <p className="text-accent text-sm mb-4">{error}</p>}

      {!selectedFood && results.length > 0 && (
        <ul className="max-w-sm space-y-2 mb-6">
          {results.map((food) => (
            <li key={food.id}>
              <button
                onClick={() => setSelectedFood(food)}
                className="w-full text-left px-3 py-2 rounded-lg bg-bg-card border border-bg-border hover:border-accent"
              >
                <p className="text-sm">{food.name}</p>
                <p className="text-xs text-text-muted">
                  {Math.round(food.caloriesPer100g)} kcal / 100g
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedFood && (
        <form onSubmit={handleSave} className="max-w-sm space-y-4">
          <p className="text-sm">
            Selected: <span className="text-accent">{selectedFood.name}</span>
          </p>
          <input
            type="number"
            value={quantityG}
            onChange={(e) => setQuantityG(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
            placeholder="Quantity in grams"
          />
          {previewCalories !== null && (
            <p className="text-text-muted text-sm">≈ {previewCalories} kcal</p>
          )}
          <button
            type="submit"
            className="w-full bg-accent text-accent-dark py-2 rounded-lg font-medium"
          >
            Save meal
          </button>
          <button
            type="button"
            onClick={() => setSelectedFood(null)}
            className="w-full text-text-muted text-sm"
          >
            ← back to search
          </button>
        </form>
      )}
    </div>
  );
}