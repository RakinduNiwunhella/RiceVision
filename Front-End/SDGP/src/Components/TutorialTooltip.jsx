import React, { useEffect, useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

/**
 * Cloud/Callout tutorial tooltip component with integrated pointer
 * Displays helpful guidance next to interactive elements with a smooth curved pointer
 */
const TutorialTooltip = ({
  visible = false,
  position = 'bottom', // 'top', 'bottom', 'left', 'right'
  title,
  action, // What to click
  outcome, // What happens
  onDismiss,
  onNext,
  onPrevious,
  isDarkMode = true,
  elementRef, // Optional ref to position tooltip near element
  step = 0,
  totalSteps = 1,
}) => {
  const [styles, setStyles] = useState({})
  const [pointerStyle, setPointerStyle] = useState({})

  useEffect(() => {
    if (!visible || !elementRef?.current) return

    const element = elementRef.current
    
    // Scroll element into view with 'nearest' to keep header visible
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch (e) {
      console.warn('Failed to scroll element into view:', e)
    }
    
    // Calculate position immediately (don't wait for scroll)
    const calculatePosition = () => {
      if (!elementRef?.current) return
      
      const rect = elementRef.current.getBoundingClientRect()
      const tooltip = document.querySelector('[data-tutorial-tooltip="true"]')
      
      if (!tooltip) return

      const tooltipRect = tooltip.getBoundingClientRect()
      const pointerSize = 14
      const gapSize = 12
      let top = 0
      let left = 0
      let pointerPos = 'bottom'

      // Calculate tooltip position based on specified position
      // Position tooltip centered on element when possible
      const elementCenterX = rect.left + rect.width / 2
      const elementCenterY = rect.top + rect.height / 2

      switch (position) {
        case 'bottom':
          top = rect.bottom + gapSize
          left = elementCenterX - tooltipRect.width / 2
          pointerPos = 'top'
          break
        case 'top':
          top = rect.top - tooltipRect.height - gapSize
          left = elementCenterX - tooltipRect.width / 2
          pointerPos = 'bottom'
          break
        case 'right':
          top = elementCenterY - tooltipRect.height / 2
          left = rect.right + gapSize
          pointerPos = 'left'
          break
        case 'left':
          top = elementCenterY - tooltipRect.height / 2
          left = rect.left - tooltipRect.width - gapSize
          pointerPos = 'right'
          break
        default:
          break
      }

      // Clamp to window bounds with padding
      const padding = 16
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))

      // Calculate pointer position relative to tooltip
      let pointerX = '50%'
      let pointerY = '50%'

      if (position === 'bottom' || position === 'top') {
        // Adjust pointer horizontal position based on actual left offset
        const tooltipCenterX = left + tooltipRect.width / 2
        const offsetX = elementCenterX - tooltipCenterX
        pointerX = `calc(50% + ${offsetX}px)`
      } else {
        // Adjust pointer vertical position based on actual top offset
        const tooltipCenterY = top + tooltipRect.height / 2
        const offsetY = elementCenterY - tooltipCenterY
        pointerY = `calc(50% + ${offsetY}px)`
      }

      setStyles({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 50,
      })

      setPointerStyle({
        position: pointerPos,
        pointerX,
        pointerY,
      })
    }

    // Calculate position immediately
    calculatePosition()
    
    // Also recalculate after a delay to account for scroll completion
    const timer = setTimeout(calculatePosition, 300)

    // Recalculate on window resize and scroll
    const handleResize = () => calculatePosition()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [visible, elementRef, position])

  if (!visible) return null

  const bgColor = isDarkMode
    ? 'bg-slate-900/30 backdrop-blur-md border border-emerald-500/50 text-white'
    : 'bg-white/30 backdrop-blur-md border border-emerald-400/50 text-slate-900'

  // Simple pointer using CSS borders - points directly to element
  const CloudPointer = () => {
    const { position, pointerX, pointerY } = pointerStyle

    if (position === 'top') {
      // Pointer pointing up from tooltip bottom
      return (
        <div
          style={{
            position: 'absolute',
            bottom: `-10px`,
            left: pointerX,
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: `10px 10px 0 10px`,
            borderColor: isDarkMode
              ? 'rgba(15, 23, 42, 0.3) transparent transparent transparent'
              : 'rgba(255, 255, 255, 0.3) transparent transparent transparent',
          }}
        />
      )
    } else if (position === 'bottom') {
      // Pointer pointing down from tooltip top
      return (
        <div
          style={{
            position: 'absolute',
            top: `-10px`,
            left: pointerX,
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: `0 10px 10px 10px`,
            borderColor: isDarkMode
              ? 'transparent transparent rgba(15, 23, 42, 0.3) transparent'
              : 'transparent transparent rgba(255, 255, 255, 0.3) transparent',
          }}
        />
      )
    } else if (position === 'left') {
      // Pointer pointing left from tooltip right
      return (
        <div
          style={{
            position: 'absolute',
            right: `-10px`,
            top: pointerY,
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: `10px 0 10px 10px`,
            borderColor: isDarkMode
              ? 'transparent transparent transparent rgba(15, 23, 42, 0.3)'
              : 'transparent transparent transparent rgba(255, 255, 255, 0.3)',
          }}
        />
      )
    } else if (position === 'right') {
      // Pointer pointing right from tooltip left
      return (
        <div
          style={{
            position: 'absolute',
            left: `-10px`,
            top: pointerY,
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: `10px 10px 10px 0`,
            borderColor: isDarkMode
              ? 'transparent rgba(15, 23, 42, 0.3) transparent transparent'
              : 'transparent rgba(255, 255, 255, 0.3) transparent transparent',
          }}
        />
      )
    }

    return null
  }

  return (
    <div
      style={styles}
      className={`${bgColor} rounded-2xl px-4 py-3 shadow-2xl shadow-black/30 w-80 animate-fadeIn relative pointer-events-auto`}
      data-tutorial-tooltip="true"
    >
      {/* Cloud pointer */}
      <CloudPointer />

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute -top-2 -right-2 bg-emerald-500/80 hover:bg-emerald-600 rounded-full p-1 transition z-50 shadow-lg"
      >
        <X size={14} className="text-white" />
      </button>

      {/* Title */}
      {title && (
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          <span className="text-emerald-400 text-lg leading-none">✦</span>
          {title}
        </h4>
      )}

      {/* Action (what to do) */}
      {action && (
        <div className="text-xs mb-2">
          <p className="text-emerald-300 font-medium">What to do:</p>
          <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            {action}
          </p>
        </div>
      )}

      {/* Outcome (what happens) */}
      {outcome && (
        <div className="text-xs mb-3">
          <p className="text-cyan-300 font-medium">What happens:</p>
          <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            {outcome}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {step + 1} / {totalSteps}
        </span>
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={onPrevious}
              className="p-1.5 hover:bg-white/10 rounded transition"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {step < totalSteps - 1 && (
            <button
              onClick={onNext}
              className="p-1.5 hover:bg-white/10 rounded transition"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          )}
          {step === totalSteps - 1 && (
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded text-xs font-medium transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TutorialTooltip
