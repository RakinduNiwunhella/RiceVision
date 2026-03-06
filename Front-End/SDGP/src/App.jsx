import React from 'react'
import Header from './Components/Navbar/Header'
import { Outlet } from 'react-router-dom'
import bgImage from './Components/assets/user_paddy_bg_v3.jpg'

const App = () => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Global dark overlay — single source of truth for darkening */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/35 to-black/50 pointer-events-none z-0" />

      {/* Fixed Header */}
      <Header />

      {/* Main content (scrolls) */}
      <main className="relative z-10 pt-28 px-6 pb-6 overflow-y-auto h-screen text-white transition-colors duration-500">
        <Outlet />
      </main>
    </div>
  )
}

export default App