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
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-bg-card border border-bg-border p-8 rounded-2xl w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-medium text-text">Log in</h1>
        {error && <p className="text-accent text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg border border-bg-border text-text placeholder-text-muted focus:outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg border border-bg-border text-text placeholder-text-muted focus:outline-none focus:border-accent"
          required
        />
        <button
          type="submit"
          className="w-full bg-accent hover:opacity-90 text-accent-dark py-2 rounded-lg font-medium transition"
        >
          Log in
        </button>
        <p className="text-text-muted text-sm text-center">
          No account?{" "}
          <Link to="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}