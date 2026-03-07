import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

import Notifications from '../Notifications/Notifications'

const Header = () => {
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch unread notifications count when component mounts
    async function fetchUnreadCount() {
      try {
        const response = await fetch('/api/notifications/unread-count')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error)
      }
    }
    fetchUnreadCount()
  }, [])

  const navItems = [
    { label: 'Dashboard', icon: 'apps', path: '/dashboard' },
    { label: 'Map', icon: 'map', path: '/field-map' },
    { label: 'Weather', icon: 'cloud', path: '/weather' },
    { label: 'Alerts', icon: 'notification_important', path: '/alerts' },
    { label: 'Report', icon: 'bar_chart', path: '/report' },
    { label: 'Help', icon: 'help', path: '/help' },
  ]

  // Handler to close notifications panel and reset unread count
  const handleCloseNotifications = () => {
    setShowNotifications(false)
    setUnreadCount(0)
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50 glass h-14 rounded-2xl shadow-2xl border-white/20">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full gap-4">

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
              <img
                src={logo}
                alt="RiceVision"
                className="h-9 w-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar max-w-[50%] lg:max-w-none">
            <div className="flex items-center min-w-max">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${isActive
                      ? "bg-white/15 text-white shadow-xl shadow-black/5 border border-white/20"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Search Bar - Glass variant */}
            <div className="relative group hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-400 transition text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search analytics..."
                className="w-48 xl:w-64 bg-white/5 border border-white/10 rounded-xl py-1.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 -translate-x-1/2 translate-y-1/2 bg-emerald-500 text-white text-[10px] font-bold rounded-full px-1.5 leading-none animate-pulse select-none pointer-events-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && <Notifications onClose={handleCloseNotifications} />}
            </div>

            {/* Avatar */}
            <Link
              to="/profile"
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white ring-1 ring-white/20 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition"
              title="View Profile"
            >
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header