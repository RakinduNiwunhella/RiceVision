import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import logo from '../assets/logo.png'
import Notifications from '../Notifications/Notifications'
import { supabase } from "../../supabaseClient";

const Header = () => {
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', icon: 'apps', path: '/dashboard' },
    { label: 'Field Data', icon: 'table_chart', path: '/field-data' },
    { label: 'Map', icon: 'map', path: '/field-map' },
    { label: 'Weather', icon: 'cloud', path: '/weather' },
    { label: 'Alerts', icon: 'notification_important', path: '/alerts' },
    { label: 'Report', icon: 'bar_chart', path: '/report' },
    { label: 'Help', icon: 'help', path: '/help' },
  ]

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50 glass h-14 rounded-2xl shadow-2xl border-white/20 overflow-visible">
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
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
                title="Toggle Dark Mode"
              >
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
              </button>
              <button
                className="h-8 px-2 rounded-lg flex items-center gap-1 text-white/50 hover:text-white hover:bg-white/10 transition"
                title="Language"
              >
                <span className="material-symbols-outlined text-[20px]">language</span>
                <span className="text-xs font-semibold">EN</span>
              </button>
              <NotificationButton />
            </div>

            {/* Avatar */}
            <Link
              to="/profile"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
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


// notification-specific button component so header stays clean
function NotificationButton() {
  const [show, setShow] = useState(false);
  const [unread, setUnread] = useState(0);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [maxHeight, setMaxHeight] = useState(0);
  const buttonRef = useRef(null);

  // directly query supabase for unread count from notificationpanel table
  const fetchCount = async () => {
    try {
      const { data, error } = await supabase
        .from("notificationpanel")
        .select("id", { count: 'exact', head: true })
        .eq("is_read", false);
      if (error) throw error;
      // supabase returns count via data.length when head=true so use it
      setUnread(data?.length || 0);
    } catch (e) {
      console.error("failed to get notifications count", e);
    }
  };

  useEffect(() => {
    // fetch unread count when component mounts or panel visibility changes
    fetchCount();
  }, [show]);

  const handleRead = (id) => {
    // decrement badge and refresh from server to stay accurate
    setUnread((u) => Math.max(0, u - 1));
    fetchCount();
  };

  // close when clicking outside
  const wrapperRef = React.useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // recalc coords and available height when button toggles
  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const top = rect.bottom + 8;
      setCoords({ top, right: window.innerWidth - rect.right });
      // available space below the button (with some margin)
      setMaxHeight(window.innerHeight - top - 16);
    }
  }, [show]);

  const panel = (
    <Notifications
      onRead={handleRead}
      style={{
        position: 'fixed',
        top: coords.top,
        right: coords.right,
        zIndex: 9999,
        width: '20rem',
        maxHeight: maxHeight > 0 ? maxHeight : '24rem',
        overflowY: 'auto',
      }}
    />
  );

  return (
    <div ref={wrapperRef} className="relative overflow-visible">
      <button
        ref={buttonRef}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition relative"
        title="Notifications"
        onClick={() => setShow((s) => !s)}
      >
        <span className="material-symbols-outlined text-[20px]">
          notifications
        </span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {show && createPortal(panel, document.body)}
    </div>
  );
}

export default Header