import { Link } from "react-router-dom";
import { Dumbbell, Apple } from "lucide-react";

export default function LogOptions() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">What are you logging?</h1>
      <div className="space-y-3">
        <Link
          to="/log-workout"
          className="flex items-center gap-4 bg-bg-card border border-bg-border rounded-2xl p-5"
        >
          <div className="bg-accent/10 p-3 rounded-full">
            <Dumbbell className="text-accent" size={22} />
          </div>
          <div>
            <p className="font-medium">Log a workout</p>
            <p className="text-text-muted text-sm">Sets, reps, or cardio</p>
          </div>
        </Link>

        <Link
          to="/log-meal"
          className="flex items-center gap-4 bg-bg-card border border-bg-border rounded-2xl p-5"
        >
          <div className="bg-accent/10 p-3 rounded-full">
            <Apple className="text-accent" size={22} />
          </div>
          <div>
            <p className="font-medium">Log a meal</p>
            <p className="text-text-muted text-sm">Search real nutrition data</p>
          </div>
        </Link>
      </div>
    </div>
  );
}