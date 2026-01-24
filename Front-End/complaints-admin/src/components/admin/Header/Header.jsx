import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  // ✅ Always start in LIGHT mode
  const [isDark, setIsDark] = useState(false);

  // ✅ Apply dark mode class properly
  useEffect(() => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white dark:bg-slate-900 shadow-md dark:shadow-black/30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center group cursor-pointer">
            <img src="/logoSDGP.webp" alt="SDGP Logo" className="h-12 w-auto" />
          </div>

          {/* Center search */}
          <div className="flex-1 px-4 hidden md:flex items-center">
            <div className="relative w-full max-w-2xl mx-auto">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                style={{ fontSize: 20 }}
              >
                search
              </span>

              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-36 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow transition">
                  <span
                    className="material-symbols-outlined text-slate-600"
                    style={{ fontSize: 18 }}
                  >
                    tune
                  </span>
                  <span className="text-sm text-slate-600">Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Header icons */}
          <div className="flex items-center space-x-6 lg:space-x-8 mt-2">
            {/* Language */}
            <span className="material-symbols-outlined text-gray-800 dark:text-slate-300">
              language
            </span>

            {/* ✅ Dark mode toggle (WORKING) */}
            <button
              onClick={() => setIsDark((prev) => !prev)}
              aria-label="Toggle dark mode"
              className="flex items-center"
            >
              <span className="material-symbols-outlined text-gray-800 dark:text-slate-300">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Notifications */}
            <span className="material-symbols-outlined text-gray-800 dark:text-slate-300">
              notifications
            </span>

            {/* Profile */}
            <span className="material-symbols-outlined text-gray-800 dark:text-slate-300">
              contacts_product
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
