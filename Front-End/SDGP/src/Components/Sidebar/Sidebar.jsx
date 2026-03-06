import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { id: 'dashboard', label: 'My Dashboard', icon: 'apps' },
  { id: 'field-map', label: 'Field Map', icon: 'map' },
  { id: 'field-data', label: 'Field Data', icon: 'agriculture' },
  { id: 'alerts', label: 'Alerts', icon: 'notification_important' },
  { id: 'weather', label: 'Weather', icon: 'cloud' },
  { id: 'report', label: 'Report', icon: 'bar_chart' },
]

const bottomItems = [
  { id: 'profile', label: 'My Profile', icon: 'person' },
  { id: 'help', label: 'Help & FAQ', icon: 'help_outline' },
  { id: '#', label: 'Logout', icon: 'logout' },
]

const linkBase =
  'flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 group'

const linkActive =
  'text-white bg-gradient-to-r from-emerald-600/80 to-cyan-600/60 shadow-lg shadow-emerald-900/20 border border-emerald-500/20'

const linkInactive =
  'text-slate-400 hover:text-white hover:bg-white/[0.05]'

const Sidebar = () => {
  const isActive = (isActiveRoute, itemId) =>
    isActiveRoute || (location.pathname === '/' && itemId === 'dashboard')

  return (
    <aside className="h-full w-60 bg-slate-900/60 backdrop-blur-xl px-4 py-5 flex flex-col justify-between border-r border-white/[0.06]">
      {/* Top nav */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive: active }) =>
              `${linkBase} ${isActive(active, item.id) ? linkActive : linkInactive}`
            }
          >
            <span
              className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined transition-transform duration-200 group-hover:scale-110"
              style={{ fontSize: '20px' }}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>

            {/* Active indicator dot */}
            {item.id === 'dashboard' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-[.active]:opacity-100" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <nav className="flex flex-col gap-0.5">
        <div className="mb-2 border-t border-white/[0.05]" />
        {bottomItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive: active }) =>
              `${linkBase} ${active ? linkActive : linkInactive}`
            }
          >
            <span
              className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined"
              style={{ fontSize: '20px' }}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar