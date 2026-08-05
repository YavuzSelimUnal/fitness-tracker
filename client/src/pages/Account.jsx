import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../lib/api.js";

export default function Account() {
  const { user, logout } = useAuth();
  const [customExercises, setCustomExercises] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    api.get("/exercises").then((res) => {
      // Only show exercises this specific user created via chat
      setCustomExercises(res.data.filter((ex) => ex.isCustom && ex.createdById === user?.id));
    });
  }, [user]);

  async function handleSave(id) {
    const res = await api.patch(`/exercises/${id}`, { metValue: Number(editValue) });
    setCustomExercises((prev) => prev.map((ex) => (ex.id === id ? res.data : ex)));
    setEditingId(null);
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
                      <button onClick={() => handleSave(ex.id)} className="text-accent text-sm">
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(ex.id); setEditValue(ex.metValue); }}
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
        className="w-full bg-bg-card border border-bg-border text-accent py-3 rounded-xl font-medium"
      >
        Log out
      </button>
    </div>
  );
}