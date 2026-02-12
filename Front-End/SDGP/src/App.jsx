import React from 'react'
import Header from './Components/Navbar/Header'
import Sidebar from './Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import Dashboard from './Components/Sites/MyDashboard';
import Alerts from './Components/Sites/Alerts';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="h-screen bg-gray-200 dark:bg-slate-900 transition-all duration-500 overflow-hidden">
      {/* Fixed Header */}
      <Header />

      {/* Layout below header & */}
      <div className="flex pt-14 h-full overflow-hidden">
        {/* Sidebar (no scroll) */}
        <aside className="h-[calc(100vh-3.5rem)] overflow-hidden flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main content (scrolls) */}
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
          <Routes>
            <Route path="/" element={<Dashboard />} />          {/* default */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />      {/* this links the sidebar to Alerts */}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App