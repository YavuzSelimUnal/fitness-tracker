import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../lib/api.js";

export default function WeightTracker() {
  const [logs, setLogs] = useState([]);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/weight").then((res) => setLogs(res.data)).finally(() => setLoading(false));
  }, []);

  async function handleLog(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/weight", { weightKg: Number(newWeight) });
      setLogs((prev) => [...prev, res.data]);
      setNewWeight("");
    } finally {
      setSaving(false);
    }
  }

  const current = logs[logs.length - 1]?.weightKg;

  // Recharts needs a plain array of objects — reshape the raw logs
  // into { label, weight } for the chart's x/y axes.
  const chartData = logs.map((log) => ({
    label: new Date(log.loggedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    weight: log.weightKg,
  }));

  if (loading) {
    return <p className="text-text-muted text-sm">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Weight tracker</h1>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-4">
        <p className="text-sm mb-2">Trend</p>
        {chartData.length < 2 ? (
          <p className="text-text-muted text-sm py-8 text-center">
            Log at least two entries to see your trend.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#2a2b2e" vertical={false} />
              <XAxis dataKey="label" stroke="#8a8a8d" fontSize={11} />
              <YAxis stroke="#8a8a8d" fontSize={11} width={35} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#19191b", border: "1px solid #2a2b2e", fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="#e8543a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-6">
        <p className="text-text-muted text-xs mb-1">Current weight</p>
        <p className="text-xl font-semibold">{current ? `${current} kg` : "Not logged yet"}</p>
      </div>

      <form onSubmit={handleLog} className="flex gap-2">
        <input
          type="number"
          step="0.1"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          placeholder="Weight in kg"
          className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text"
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-accent text-accent-dark px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          Log
        </button>
      </form>
    </div>
  );
}