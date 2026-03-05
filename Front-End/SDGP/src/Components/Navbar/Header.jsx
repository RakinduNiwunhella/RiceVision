import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', icon: 'apps', path: '/dashboard' },
    { label: 'Map', icon: 'map', path: '/field-map' },
    { label: 'Weather', icon: 'cloud', path: '/weather' },
    { label: 'Alerts', icon: 'notification_important', path: '/alerts' },
    { label: 'Report', icon: 'bar_chart', path: '/report' },
    { label: 'Help', icon: 'help', path: '/help' },
  ]

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50 glass h-14 rounded-2xl shadow-2xl border-white/20">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full gap-4">

          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="material-symbols-outlined text-white text-xl">
                visibility
              </span>
            </div>
            <span className="text-sm font-bold tracking-tight text-white hidden sm:block">RiceVision</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
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
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition">
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition">
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>
              </button>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-black tracking-tighter ring-1 ring-white/20 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition">
              USER
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header