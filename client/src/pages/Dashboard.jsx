import { useAuth } from "../hooks/useAuth.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-white"
        >
          Log out
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-gray-800 rounded-xl p-5">
          <h2 className="font-medium mb-2">Today's workout</h2>
          <p className="text-gray-400 text-sm">Not logged yet.</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5">
          <h2 className="font-medium mb-2">Today's meals</h2>
          <p className="text-gray-400 text-sm">Not logged yet.</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm mt-8">
        This is a placeholder dashboard — next up: workout logging, meal
        logging, progress charts, and the AI chat assistant.
      </p>
    </div>
  );
}
