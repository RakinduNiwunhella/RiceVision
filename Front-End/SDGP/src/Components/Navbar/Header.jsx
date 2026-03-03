import React, { useEffect, useState } from 'react'
import Notifications from '../Notifications/Notifications'

const Header = () => {
  const [isDark, setIsDark] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  const BASE_URL =
    import.meta.env.VITE_API_BASE ||
    "https://ricevision-backend.onrender.com"

  // Fetch notifications from FastAPI
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notifications`)
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
      })

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      )
    } catch (error) {
      console.error("Error updating notification:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (isDark) html.classList.add('dark')
    else html.classList.remove('dark')
  }, [isDark])

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-slate-900 shadow-md">
      <div className="flex justify-end items-center h-14 px-6 space-x-6">

        {/* Dark Mode */}
        <button onClick={() => setIsDark(prev => !prev)}>
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(prev => !prev)}
          className="relative"
        >
          <span className="material-symbols-outlined">
            notifications
          </span>

          {notifications.filter(n => !n.is_read).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {notifications.filter(n => !n.is_read).length}
            </span>
          )}
        </button>

      </div>

      {showNotifications && (
        <Notifications
          notifications={notifications}
          markAsRead={markAsRead}
        />
      )}
    </nav>
  )
}

export default Header