import React from 'react'
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'My Dashboard', icon: 'apps' },
  { id: 'field-map', label: 'Field Map', icon: 'map' },
  { id: 'field-data', label: 'Field Data', icon: 'agriculture' },
  { id: 'alerts', label: 'Alerts', icon: 'notification_important' },
  { id: 'weather', label: 'Weather', icon: 'cloud' },
  { path: 'report', label: 'Report', icon: 'bar_chart' }, // Changed id to path for clarity
]

const bottomItems = [
  { id: 'profile', label: 'My Profile', icon: 'person' },
  { id: 'help', label: 'Help & FAQ', icon: 'help_outline' },
  { id: 'logout', label: 'Logout', icon: 'logout' },
]

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="h-full w-60 bg-white dark:bg-slate-900 px-6 py-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
      <div>
        <nav className="flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              // FIXED: Added /app/ prefix to all navigation items
              to={`/app/${item.id}`} 
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-3 rounded-md transition-all duration-150 ${
                    isActive
                    ? 'text-white bg-linear-to-r from-blue-400 to-teal-400 shadow-md dark:from-blue-700 dark:to-teal-700'
                    : 'text-gray-700 hover:text-black dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              <span className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined" style={{ fontSize: '22px' }}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <nav className="flex flex-col gap-1">
          {bottomItems.map(item => {
            // Handle Logout differently if needed
            if (item.id === 'logout') {
                return (
                    <button 
                        key={item.id}
                        onClick={() => {/* add logout logic here */}}
                        className="flex items-center gap-3 py-1 px-3 rounded-md text-gray-700 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 transition-all"
                    >
                        <span className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined" style={{ fontSize: '22px' }}>
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                )
            }

            return (
              <NavLink
                key={item.id}
                // FIXED: Added /app/ prefix for profile and help
                to={`/app/${item.id}`} 
                className={({ isActive }) =>
                  `flex items-center gap-3 py-1 px-3 rounded-md transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-linear-to-r from-blue-400 to-teal-400 shadow-md dark:from-blue-700 dark:to-teal-700'
                      : 'text-gray-700 hover:text-black dark:text-slate-300 dark:hover:text-white'
                  }`
                }
              >
                <span className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined" style={{ fontSize: '22px' }}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar;