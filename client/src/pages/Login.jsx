import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-semibold text-white">Log in</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-medium"
        >
          Log in
        </button>
        <p className="text-gray-400 text-sm text-center">
          No account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
