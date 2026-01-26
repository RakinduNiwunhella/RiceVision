import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/services/client";

/* -------------------- NAV ITEMS -------------------- */

const navItems = [
  { id: "", label: "Dashboard", icon: "dashboard" },
  { id: "complaints", label: "Complaints", icon: "report_problem" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "settings", label: "Settings", icon: "settings" },
];

/* -------------------- COMPONENT -------------------- */

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="h-screen w-60 bg-white dark:bg-slate-900 px-6 py-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
      {/* Top navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={`/admin${item.id ? `/${item.id}` : ""}`}
            end={item.id === ""}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-3 rounded-md transition-all duration-150 ${
                isActive
                  ? "text-white bg-gradient-to-r from-blue-500 to-teal-500 shadow-md"
                  : "text-gray-700 hover:text-black hover:bg-gray-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`
            }
          >
            <span className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined">
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <nav>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-3 rounded-md transition-all duration-150
            text-gray-700 hover:text-black hover:bg-gray-100
            dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
        >
          <span className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined">
            logout
          </span>
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
