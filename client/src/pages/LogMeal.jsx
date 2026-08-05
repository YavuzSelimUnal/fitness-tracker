import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";

export default function LogMeal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]); // items being built up before saving/logging
  const [error, setError] = useState("");
  const [savedMeals, setSavedMeals] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/saved-meals").then((res) => setSavedMeals(res.data));
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.get("/foods/search", { params: { q: query } });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Search failed");
    }
  }

  function addToCart(food) {
    setCart((prev) => [...prev, { food, quantityG: 100 }]);
    setResults([]);
    setQuery("");
  }

  function updateCartQuantity(index, quantityG) {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, quantityG } : item)));
  }

  function removeFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleLogAll() {
    setError("");
    try {
      for (const item of cart) {
        await api.post("/meals", { foodItemId: item.food.id, quantityG: Number(item.quantityG) });
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  async function handleSaveCombo() {
    if (!saveName.trim()) return;
    await api.post("/saved-meals", {
      name: saveName,
      items: cart.map((item) => ({ foodItemId: item.food.id, quantityG: Number(item.quantityG) })),
    });
    setShowSaveForm(false);
    setSaveName("");
    const res = await api.get("/saved-meals");
    setSavedMeals(res.data);
  }

  async function handleQuickLog(savedMealId) {
    await api.post(`/saved-meals/${savedMealId}/log`);
    navigate("/");
  }

  const totalCalories = cart.reduce((sum, item) => {
    return sum + Math.round((item.quantityG / 100) * item.food.caloriesPer100g);
  }, 0);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Log a meal</h1>

      {savedMeals.length > 0 && cart.length === 0 && (
        <div className="mb-6">
          <p className="text-sm text-text-muted mb-2">Quick log</p>
          <div className="space-y-2">
            {savedMeals.map((saved) => (
              <div
                key={saved.id}
                className="flex justify-between items-center bg-bg-card border border-bg-border rounded-xl p-3"
              >
                <div>
                  <p className="text-sm">{saved.name}</p>
                  <p className="text-text-muted text-xs">
                    {saved.items.map((i) => i.foodItem.name).join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLog(saved.id)}
                  className="text-accent text-sm font-medium"
                >
                  Log
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search a food, e.g. chicken breast"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-bg-card border border-bg-border text-text">
          Search
        </button>
      </form>

      {error && <p className="text-accent text-sm mb-4">{error}</p>}

      {results.length > 0 && (
        <ul className="space-y-2 mb-6">
          {results.map((food) => (
            <li key={food.id}>
              <button
                onClick={() => addToCart(food)}
                className="w-full text-left px-3 py-2 rounded-lg bg-bg-card border border-bg-border hover:border-accent"
              >
                <p className="text-sm">{food.name}</p>
                <p className="text-xs text-text-muted">{Math.round(food.caloriesPer100g)} kcal / 100g</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-sm text-text-muted">Building this meal:</p>
          {cart.map((item, i) => (
            <div key={i} className="bg-bg-card border border-bg-border rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">{item.food.name}</p>
                <button onClick={() => removeFromCart(i)} className="text-text-muted text-xs">
                  Remove
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.quantityG}
                  onChange={(e) => updateCartQuantity(i, e.target.value)}
                  className="w-24 px-2 py-1 rounded bg-bg border border-bg-border text-text text-sm"
                />
                <span className="text-text-muted text-xs">
                  g · {Math.round((item.quantityG / 100) * item.food.caloriesPer100g)} kcal
                </span>
              </div>
            </div>
          ))}

          <p className="text-sm text-text-muted">Total: {totalCalories} kcal</p>

          <button onClick={handleLogAll} className="w-full bg-accent text-accent-dark py-2 rounded-lg font-medium">
            Log this meal
          </button>

          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full border border-bg-border text-text-muted py-2 rounded-lg text-sm"
            >
              Save as a combo for next time
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='e.g. "My usual breakfast"'
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text text-sm"
              />
              <button onClick={handleSaveCombo} className="bg-accent text-accent-dark px-4 rounded-lg text-sm font-medium">
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}