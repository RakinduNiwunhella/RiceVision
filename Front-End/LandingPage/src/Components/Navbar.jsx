import React, { useState, useEffect } from 'react'
import logo from '/images/Logo-RiceVision.webp'

const Navbar = ({ onOpenRegister }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')

  // Default = LIGHT mode
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }

  const handleLinkClick = () => setMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
      {/* Full-width bar so corners align with viewport */}
      <div className="flex w-full items-center justify-between px-4 md:px-8 py-3">
        
        {/* Left: logo */}
        <div className="flex items-center gap-2">
          <img src={logo} className="h-9 md:h-11" alt="RiceVision logo" />
        </div>

        {/* Center: desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <a href="#info" className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
            Overview
          </a>
          <a href="#mission" className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
            Mission
          </a>
          <a href="#goal" className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
            Goal
          </a>
          <a href="#features" className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
            Features
          </a>
          <a href="#contact" className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
            Contact Us
          </a>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle (desktop) */}
          <button
            onClick={toggleTheme}
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-300 dark:border-slate-600 
                       text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            <span className="material-icons text-base">
              {theme === 'light' ? 'brightness_2' : 'light_mode'}
            </span>
          </button>

          {/* Get Started (desktop) */}
          <button
            onClick={() => { setMenuOpen(false); onOpenRegister?.() }}
            className="hidden md:inline-flex items-center bg-green-700 dark:bg-green-600 text-white px-5 py-2 text-sm font-semibold rounded-md hover:bg-green-800 dark:hover:bg-green-700 transition"
          >
            Get Started
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={menuOpen ? 'Close main menu' : 'Open main menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span className="material-icons text-2xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu (slide-down) */}
      <div
        id="mobile-nav"
        className={`
          md:hidden overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950
          transition-all duration-200 ease-out
          ${menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 py-3 space-y-3 text-sm font-medium">
          <a
            href="#info"
            onClick={handleLinkClick}
            className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Overview
          </a>
          <a
            href="#mission"
            onClick={handleLinkClick}
            className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Mission
          </a>
          <a
            href="#goal"
            onClick={handleLinkClick}
            className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Goal
          </a>
          <a
            href="#features"
            onClick={handleLinkClick}
            className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Features
          </a>
          <a
            href="#contact"
            onClick={handleLinkClick}
            className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Contact Us
          </a>

          <div className="pt-1 border-t border-slate-200 dark:border-slate-800 mt-2 space-y-2">
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span className="material-icons text-base">
                {theme === 'light' ? 'brightness_2' : 'light_mode'}
              </span>
              <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
            </button>

            {/* Mobile Get Started */}
            <button
              onClick={() => { setMenuOpen(false); onOpenRegister?.() }}
              className="w-full bg-green-700 dark:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-green-800 dark:hover:bg-green-700 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
