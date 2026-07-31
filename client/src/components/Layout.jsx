import BottomNav from "./BottomNav.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-md mx-auto px-6 pt-6 pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}