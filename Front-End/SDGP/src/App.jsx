import React from 'react'
import Header from './Components/Navbar/Header'
import { Outlet } from 'react-router-dom'
import bgImage from '/src/Components/assets/field1.jpg'
import YieldChatbot from './Components/chatbot/Yieldchatbot'
import { useTheme } from './context/ThemeContext'

const App = () => {
  const { isDark } = useTheme()

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
      {/* Global dark overlay — adjusts for night mode */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-all duration-500 ${
        isDark
          ? 'bg-linear-to-br from-black/85 via-black/75 to-black/85'
          : 'bg-linear-to-br from-black/55 via-black/35 to-black/50'
      }`} />

      {/* Fixed Header */}
      <Header />

      <YieldChatbot />

      {/* Main content (scrolls) */}
      <main className="relative z-10 pt-[72px] px-6 pb-6 overflow-y-auto h-screen text-white transition-colors duration-500 text-sm">
        <Outlet />
      </main>
    </div>
  )
}

export default App