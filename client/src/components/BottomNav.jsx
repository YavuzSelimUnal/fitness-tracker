import { NavLink } from "react-router-dom";
import { LayoutGrid, Apple, Plus, TrendingUp, User } from "lucide-react";

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 text-[10px] ${
          isActive ? "text-accent" : "text-text-muted"
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg border-t border-bg-border px-6 py-3 flex justify-around items-center max-w-md mx-auto">
      <NavItem to="/" icon={LayoutGrid} label="Dashboard" />
      <NavItem to="/food-log" icon={Apple} label="Food Log" />
      <NavLink to="/log" className="bg-accent text-accent-dark rounded-full p-3 -mt-6 shadow-lg">
        <Plus size={22} />
      </NavLink>
      <NavItem to="/progress" icon={TrendingUp} label="Progress" />
      <NavItem to="/account" icon={User} label="Account" />
    </div>
  );
}