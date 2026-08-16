import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../lib/api.js";
import { useTheme } from "../hooks/useTheme.jsx";

export default function Account() {
  const { user, logout, deleteAccount } = useAuth();
  const [customExercises, setCustomExercises] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    api.get("/exercises").then((res) => {
      setCustomExercises(res.data.filter((ex) => ex.isCustom && ex.createdById === user?.id));
    });
  }, [user]);

  async function handleSaveExercise(id) {
    const res = await api.patch(`/exercises/${id}`, { metValue: Number(editValue) });
    setCustomExercises((prev) => prev.map((ex) => (ex.id === id ? res.data : ex)));
    setEditingId(null);
  }

  async function handleDelete() {
    await deleteAccount();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Account</h1>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-5 mb-4">
        <p className="text-text-muted text-xs mb-1">Name</p>
        <p className="mb-4">{user?.name || "—"}</p>
        <p className="text-text-muted text-xs mb-1">Email</p>
        <p>{user?.email}</p>
      </div>

      <button
        onClick={toggleTheme}
        className="w-full bg-bg-card border border-bg-border py-3 rounded-xl font-medium mb-3 flex items-center justify-center gap-2"
      >
        {theme === "dark" ? "☀️ Switch to light mode" : "🌙 Switch to dark mode"}
      </button>

      <Link
        to="/weight"
        className="block w-full bg-bg-card border border-bg-border text-center py-3 rounded-xl font-medium mb-3"
      >
        Weight tracker
      </Link>

      {customExercises.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-text-muted mb-2">
            Custom exercises (created via chat — adjust if the calorie estimate seems off)
          </p>
          <div className="space-y-2">
            {customExercises.map((ex) => (
              <div key={ex.id} className="bg-bg-card border border-bg-border rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm">{ex.name}</p>
                  {editingId === ex.id ? (
                    <div className="flex gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 px-2 py-1 rounded bg-bg border border-bg-border text-text text-sm"
                      />
                      <button onClick={() => handleSaveExercise(ex.id)} className="text-accent text-sm">
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(ex.id);
                        setEditValue(ex.metValue);
                      }}
                      className="text-text-muted text-xs"
                    >
                      MET: {ex.metValue} (edit)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={logout}
        className="w-full bg-bg-card border border-bg-border text-accent py-3 rounded-xl font-medium mb-4"
      >
        Log out
      </button>

      <div className="pt-6 border-t border-bg-border">
        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} className="w-full text-accent text-sm">
            Delete account
          </button>
        ) : (
          <div className="bg-bg-card border border-accent rounded-xl p-4">
            <p className="text-sm mb-3">
              This permanently deletes your account and all data — workouts, meals, goals, chat history. This can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-accent text-accent-dark py-2 rounded-lg text-sm font-medium"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 border border-bg-border py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}