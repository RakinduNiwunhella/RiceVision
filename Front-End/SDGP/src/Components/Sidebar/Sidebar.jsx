import React, { useRef, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import TutorialTooltip from '../../components/TutorialTooltip'
import { usePageTutorial } from '../../hooks/usePageTutorial'

const Sidebar = () => {
  const { t } = useLanguage()

  // Tutorial setup
  const tutorialSteps = useMemo(() => [
    {
      title: "Sidebar Navigation",
      action: "Use the left sidebar to navigate between main pages",
      outcome: "You can access Dashboard, Field Map, Alerts, Weather, Reports, and more from here",
    },
    {
      title: "Top Navigation Links",
      action: "Click Dashboard, Field Map, or other items to navigate",
      outcome: "The highlighted item shows your current page. Active links have a green gradient background",
    },
    {
      title: "Bottom Options",
      action: "Profile: View your account settings. Help: Get support. Logout: Sign out",
      outcome: "Quick access to user settings and account management from any page",
    },
  ], [])

  const { currentStep, showTutorial, currentTutorialStep, nextStep, prevStep, closeTutorial } =
    usePageTutorial("sidebar", tutorialSteps)

  const sidebarRef = useRef(null)
  const navItemsRef = useRef(null)
  const bottomItemsRef = useRef(null)

  const navItems = [
    { id: 'dashboard', labelKey: 'myDashboard', icon: 'apps' },
    { id: 'field-map', labelKey: 'fieldMap',    icon: 'map' },
    { id: 'field-data', labelKey: 'fieldData',  icon: 'agriculture' },
    { id: 'alerts',    labelKey: 'alerts',      icon: 'notification_important' },
    { id: 'weather',   labelKey: 'weather',     icon: 'cloud' },
    { id: 'report',    labelKey: 'report',      icon: 'bar_chart' },
  ]

  const bottomItems = [
    { id: 'profile',  labelKey: 'myProfile', icon: 'person' },
    { id: 'help',     labelKey: 'helpFAQ',   icon: 'help_outline' },
    { id: '#',        labelKey: 'logout',    icon: 'logout' },
  ]
  const isActive = (isActiveRoute, itemId) =>
    isActiveRoute || (location.pathname === '/' && itemId === 'dashboard')

  const linkBase = 'flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 group'
  const linkActive = 'text-white bg-gradient-to-r from-emerald-600/80 to-cyan-600/60 shadow-lg shadow-emerald-900/20 border border-emerald-500/20'
  const linkInactive = 'text-slate-400 hover:text-white hover:bg-white/[0.05]'

  return (
    <aside ref={sidebarRef} className="h-full w-60 bg-slate-900/60 backdrop-blur-xl px-4 py-5 flex flex-col justify-between border-r border-white/[0.06] relative">
      {/* Top nav */}
      <nav ref={navItemsRef} className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive: active }) =>
              `${linkBase} ${isActive(active, item.id) ? linkActive : linkInactive}`
            }
          >
            <span
              className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined transition-transform duration-200 group-hover:scale-110"
              style={{ fontSize: '20px' }}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <nav ref={bottomItemsRef} className="flex flex-col gap-0.5">
        <div className="mb-2 border-t border-white/[0.05]" />
        {bottomItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive: active }) =>
              `${linkBase} ${active ? linkActive : linkInactive}`
            }
          >
            <span
              className="w-8 shrink-0 flex items-center justify-center material-symbols-outlined"
              style={{ fontSize: '20px' }}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Tutorial Tooltips */}
      {showTutorial && currentTutorialStep && (
        <>
          {currentStep === 0 && (
            <TutorialTooltip
              visible={true}
              position="right"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={sidebarRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
          {currentStep === 1 && (
            <TutorialTooltip
              visible={true}
              position="right"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={navItemsRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
          {currentStep === 2 && (
            <TutorialTooltip
              visible={true}
              position="right"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={bottomItemsRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
        </>
      )}
    </aside>
  )
}

export default Sidebar