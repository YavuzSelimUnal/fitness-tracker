import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LogWorkout from "./pages/LogWorkout.jsx";
import LogMeal from "./pages/LogMeal.jsx";
import LogOptions from "./pages/LogOptions.jsx";
import FoodLog from "./pages/FoodLog.jsx";
import Goals from "./pages/Goals.jsx";
import Account from "./pages/Account.jsx";
import WeightTracker from "./pages/WeightTracker.jsx";


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-muted">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/food-log" element={<ProtectedRoute><FoodLog /></ProtectedRoute>} />
      <Route path="/log" element={<ProtectedRoute><LogOptions /></ProtectedRoute>} />
      <Route path="/log-workout" element={<ProtectedRoute><LogWorkout /></ProtectedRoute>} />
      <Route path="/log-meal" element={<ProtectedRoute><LogMeal /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/weight" element={<ProtectedRoute><WeightTracker /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}