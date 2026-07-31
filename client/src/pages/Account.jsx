import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";


export default function Account() {
  const { user, logout } = useAuth();

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
      <button
        onClick={logout}
        className="w-full bg-bg-card border border-bg-border text-accent py-3 rounded-xl font-medium"
      >
        Log out
      </button>
    </div>
  );
}