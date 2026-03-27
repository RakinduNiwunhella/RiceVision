import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const TutorialTooltip = ({
  visible = false,
  position = 'bottom',
  title,
  action,
  outcome,
  onDismiss,
  onNext,
  onPrevious,
  isDarkMode = true,
  elementRef,
  step = 0,
  totalSteps = 1,
}) => {
  const [styles, setStyles] = useState({})
  const [pointerStyle, setPointerStyle] = useState({})

  // Apply highlight class to target element
  useEffect(() => {
    // 🧹 Clean ALL highlights first
    document
      .querySelectorAll('.tutorial-highlight')
      .forEach(el => el.classList.remove('tutorial-highlight'))

    let element = elementRef?.current

    // 🔥 Fallback for step 0 (navbar)
    if (!element && step === 0) {
      element = document.querySelector('[data-tour="navbar"]')
      console.log("🔍 Fallback navbar selector:", element)
    }

    if (!element) {
      console.log("❌ No element found for highlight", { step })
      return
    }

    // ✅ Apply ONLY when visible
    if (visible) {
      element.classList.add('tutorial-highlight')
    }

    return () => {
      element.classList.remove('tutorial-highlight')
    }
  }, [visible, step, elementRef])

  // Calculate tooltip position
  useEffect(() => {
    if (!visible) return

    const calculatePosition = () => {
      if (!elementRef?.current) {
        console.log("❌ REF NULL", elementRef)
        return
      }

      const element = elementRef.current
      const rect = element.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) {
        return
      }

      const tooltip = document.querySelector('[data-tutorial-tooltip="true"]')
      if (!tooltip) {
        console.log("❌ TOOLTIP NOT FOUND")
        return
      }

      const tooltipRect = tooltip.getBoundingClientRect()
      const gap = 12

      const elementCenterX = rect.left + rect.width / 2
      const elementCenterY = rect.top + rect.height / 2

      let top = 0
      let left = 0
      let pointerPos = 'top'

      switch (position) {
        case 'bottom':
          top = rect.bottom + gap
          left = elementCenterX - tooltipRect.width / 2
          pointerPos = 'top'
          break
        case 'top':
          top = rect.top - tooltipRect.height - gap
          left = elementCenterX - tooltipRect.width / 2
          pointerPos = 'bottom'
          break
        case 'right':
          top = elementCenterY - tooltipRect.height / 2
          left = rect.right + gap
          pointerPos = 'left'
          break
        case 'left':
          top = elementCenterY - tooltipRect.height / 2
          left = rect.left - tooltipRect.width - gap
          pointerPos = 'right'
          break
        default:
          break
      }

      const padding = 16
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))

      // pointer alignment
      let pointerX = '50%'
      let pointerY = '50%'

      if (position === 'bottom' || position === 'top') {
        const tooltipCenterX = left + tooltipRect.width / 2
        const offsetX = elementCenterX - tooltipCenterX
        pointerX = `calc(50% + ${offsetX}px)`
      } else {
        const tooltipCenterY = top + tooltipRect.height / 2
        const offsetY = elementCenterY - tooltipCenterY
        pointerY = `calc(50% + ${offsetY}px)`
      }

      setStyles({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 100000,
      })

      setPointerStyle({
        position: pointerPos,
        pointerX,
        pointerY,
      })
    }

    // CRITICAL: Delay execution to allow DOM to render
    const timer = setTimeout(calculatePosition, 250)

    const handleResize = () => calculatePosition()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [visible, elementRef, position, step])

  if (!visible) return null

  const bgColor = isDarkMode
    ? 'bg-slate-900/30 backdrop-blur-md border border-emerald-500/50 text-white'
    : 'bg-white/30 backdrop-blur-md border border-emerald-400/50 text-slate-900'

  return (
    <>
      {/* 🔥 GLOBAL DIM OVERLAY */}
      {createPortal(
        <div className="tutorial-overlay" />,
        document.body
      )}

      {/* TOOLTIP */}
      <div
        style={styles}
        className={`${bgColor} rounded-2xl px-4 py-3 shadow-2xl w-80 relative`}
        data-tutorial-tooltip="true"
      >
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"
        >
          <X size={14} />
        </button>

        {title && <h4 className="font-semibold text-sm mb-2">{title}</h4>}

        {action && (
          <div className="text-xs mb-2">
            <p className="text-emerald-300">What to do:</p>
            <p>{action}</p>
          </div>
        )}

        {outcome && (
          <div className="text-xs mb-3">
            <p className="text-cyan-300">What happens:</p>
            <p>{outcome}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {step + 1} / {totalSteps}
          </span>

          <div className="flex gap-2">
            {step > 0 && <button onClick={onPrevious} aria-label="Previous step"><ChevronLeft size={16} /></button>}
            {step < totalSteps - 1 && <button onClick={onNext} aria-label="Next step"><ChevronRight size={16} /></button>}
            {step === totalSteps - 1 && <button onClick={onDismiss}>Done</button>}
          </div>
        </div>
      </div>
    </>
  )
}

export default TutorialTooltip