import React, { useEffect, useState } from 'react'
import Header from './Components/Navbar/Header'
import Sidebar from './Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'

const App = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="h-screen bg-gray-200 dark:bg-slate-900 transition-all duration-500 overflow-hidden">
      
      <Header isDark={isDark} setIsDark={setIsDark} />

      <div className="flex pt-14 h-full overflow-hidden">
        <aside className="h-[calc(100vh-3.5rem)] overflow-hidden flex-shrink-0" >
          <Sidebar />
        </aside>

        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
          <Outlet context={{ isDark }} />
        </main>
      </div>
    </div>
  )
}

export default App