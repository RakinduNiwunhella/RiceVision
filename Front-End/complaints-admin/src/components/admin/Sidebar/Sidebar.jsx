import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "complaints", label: "Complaints", icon: "report_problem" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const bottomItems = [
  { id: "profile", label: "My Profile", icon: "person" },
  { id: "logout", label: "Logout", icon: "logout" },
];

const Sidebar = () => {
  return (
    <aside className="h-screen w-60 bg-white dark:bg-slate-900 px-6 py-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
      <div>
        {/* Main navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-3 rounded-md transition-all duration-150 ${
                  isActive
                    ? "text-white bg-linear-to-r from-blue-400 to-teal-400 shadow-md dark:from-blue-700 dark:to-teal-700"
                    : "text-gray-700 hover:text-black dark:text-slate-300 dark:hover:text-white"
                }`
              }
            >
              <span
                className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined"
                style={{ fontSize: "22px" }}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom navigation */}
      <div>
        <nav className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-150 ${
                  isActive
                    ? "text-white bg-linear-to-r from-blue-400 to-teal-400 shadow-md dark:from-blue-700 dark:to-teal-700"
                    : "text-gray-700 hover:text-black dark:text-slate-300 dark:hover:text-white"
                }`
              }
            >
              <span
                className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined"
                style={{ fontSize: "22px" }}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
