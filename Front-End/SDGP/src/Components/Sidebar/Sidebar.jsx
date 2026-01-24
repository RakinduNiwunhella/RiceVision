import React from 'react'
import { NavLink } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'My Dashboard', icon: 'apps', active: true },
  { id: 'field-map', label: 'Field Map', icon: 'map', active: false },
  { id: 'field-data', label: 'Field Data', icon: 'agriculture' , active: false},
  { id: 'alerts', label: 'Alerts', icon: 'notification_important', active: false },
  { id: 'weather', label: 'Weather', icon: 'cloud' , active: false},
  { id: 'report', label: 'Report', icon: 'bar_chart', active: false },
]

const bottomItems = [
  { id: 'profile', label: 'My Profile', icon: 'person', active: false },
  { id: 'help', label: 'Help & FAQ', icon: 'help_outline' , active: false},
  { id: '#', label: 'Logout', icon: 'logout' },
]

const Sidebar = () => {
  return (
    <aside className="h-full w-60 bg-white dark:bg-slate-900 px-6 py-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
      <div>
        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-3 rounded-md transition-all duration-150 ${
                     (isActive || (location.pathname === '/' && item.id === 'dashboard'))
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

      {/* Bottom grouped actions */}
      <div>
        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {bottomItems.map(item => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
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
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar