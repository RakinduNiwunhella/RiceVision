import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage, LANGUAGES } from '../../context/LanguageContext'
import Notifications from '../Notifications/Notifications'
import { supabase } from "../../supabaseClient"

const searchIndex = [
  { label: 'Dashboard', description: 'Overview, analytics, yield summary', icon: 'apps', path: '/dashboard' },
  { label: 'Field Data', description: 'Rice field records, crop stage, yield data', icon: 'table_chart', path: '/field-data' },
  { label: 'Map', description: 'Field map, district locations, satellite view', icon: 'map', path: '/field-map' },
  { label: 'Weather', description: 'Weather forecast, rainfall, temperature', icon: 'cloud', path: '/weather' },
  { label: 'Alerts', description: 'Disaster alerts, pest risks, past alerts', icon: 'notification_important', path: '/alerts' },
  { label: 'Report', description: 'Analytics reports, charts, export data', icon: 'bar_chart', path: '/report' },
  { label: 'Help', description: 'FAQ, documentation, support', icon: 'help', path: '/help' },
  { label: 'Profile', description: 'Account settings, preferences', icon: 'person', path: '/profile' },
]

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const [langDropdownPos, setLangDropdownPos] = useState({ top: 0, right: 0 })
  const langRef = useRef(null)
  const langBtnRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  const updateDropdownPos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
  }

  const filteredResults = searchQuery.trim()
    ? searchIndex.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
      if (langBtnRef.current && !langBtnRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (!showResults || filteredResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      navigate(filteredResults[selectedIndex].path)
      setSearchQuery('')
      setShowResults(false)
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const handleSelect = (path) => {
    navigate(path)
    setSearchQuery('')
    setShowResults(false)
  }

  const navItems = [
    { label: t('dashboard'), icon: 'apps', path: '/dashboard' },
    { label: t('fieldData'), icon: 'table_chart', path: '/field-data' },
    { label: t('map'), icon: 'map', path: '/field-map' },
    { label: t('weather'), icon: 'cloud', path: '/weather' },
    { label: t('alerts'), icon: 'notification_important', path: '/alerts' },
    { label: t('report'), icon: 'bar_chart', path: '/report' },
    { label: t('help'), icon: 'help', path: '/help' },
  ]

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

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
          <div className="hidden md:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar max-w-[50%] lg:max-w-none lg:overflow-visible">
            <div className="flex items-center min-w-max lg:min-w-0">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${isActive
                      ? "bg-white/15 text-white shadow-xl shadow-black/5 border border-white/20"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[15px] lg:text-[16px]">
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

            {/* Search Bar - Functional */}
            <div className="relative hidden lg:block" ref={searchRef}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition text-[18px] pointer-events-none" style={{ color: showResults && filteredResults.length ? 'rgb(52 211 153)' : undefined }}>
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); updateDropdownPos(); setShowResults(true) }}
                onFocus={() => { if (searchQuery) { updateDropdownPos(); setShowResults(true) } }}
                onKeyDown={handleKeyDown}
                placeholder={t('searchPlaceholder')}
                className="w-24 xl:w-36 bg-white/5 border border-white/10 rounded-xl py-1 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"
                autoComplete="off"
              />
              {showResults && (filteredResults.length > 0 || searchQuery) && createPortal(
                <div
                  style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, minWidth: 288, zIndex: 9999 }}
                  className="bg-[#0f1a12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  {filteredResults.length > 0 ? filteredResults.map((item, idx) => (
                    <button
                      key={item.path}
                      onMouseDown={() => handleSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${idx === selectedIndex ? 'bg-emerald-500/20' : 'hover:bg-white/5'}`}
                    >
                      <span className="material-symbols-outlined text-emerald-400 text-[18px]">{item.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-white/40">{item.description}</p>
                      </div>
                    </button>
                  )) : (
                    <div className="px-4 py-3">
                      <p className="text-xs text-white/40">No results for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>,
                document.body
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <button
                className="h-8 px-2 rounded-lg flex items-center gap-1 text-white/50 hover:text-white hover:bg-white/10 transition"
                title="Language"
              >
                <span className="material-symbols-outlined text-[20px]">language</span>
                <span className="text-xs font-semibold">EN</span>
              </button>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
                title="Toggle Dark Mode"
              >
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
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
function NotificationPanelButton() {
  const [show, setShow] = useState(false);
  const [unread, setUnread] = useState(0);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [maxHeight, setMaxHeight] = useState(0);

  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);

  const fetchCount = async () => {
    try {
      const { count, error } = await supabase
        .from("notificationpanel")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;
      setUnread(count || 0);
    } catch (e) {
      console.error("failed to get notifications count", e);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [show]);

  const handleRead = () => {
    fetchCount();
  };

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShow(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const top = rect.bottom + 8;

      setCoords({
        top,
        right: window.innerWidth - rect.right,
      });

      setMaxHeight(window.innerHeight - top - 16);
    }
  }, [show]);

  const panel = (
    <Notifications
      onRead={handleRead}
      style={{
        position: "fixed",
        top: coords.top,
        right: coords.right,
        zIndex: 9999,
        width: "20rem",
        maxHeight: maxHeight > 0 ? maxHeight : "24rem",
        overflowY: "auto",
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