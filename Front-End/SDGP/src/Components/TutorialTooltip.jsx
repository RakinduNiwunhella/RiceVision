import React, { useEffect, useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

/**
 * Inline tutorial tooltip component with pointer arrow
 * Displays helpful guidance next to interactive elements with an arrow pointing to the target
 */
const TutorialTooltip = ({
  visible = false,
  position = 'top', // 'top', 'bottom', 'left', 'right'
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
  const [arrowStyles, setArrowStyles] = useState({})

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
      const arrowSize = 10 // Size of the arrow
      let top = 0
      let left = 0
      let arrowTop = 0
      let arrowLeft = 0
      let arrowClass = ''

      // Calculate tooltip position based on specified position
      switch (position) {
        case 'top':
          top = rect.top - tooltipRect.height - arrowSize - 4
          left = rect.left + rect.width / 2 - tooltipRect.width / 2
          arrowTop = tooltipRect.height + 4
          arrowLeft = tooltipRect.width / 2 - arrowSize / 2
          arrowClass = 'bottom'
          break
        case 'bottom':
          top = rect.bottom + arrowSize + 4
          left = rect.left + rect.width / 2 - tooltipRect.width / 2
          arrowTop = -arrowSize - 4
          arrowLeft = tooltipRect.width / 2 - arrowSize / 2
          arrowClass = 'top'
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          left = rect.left - tooltipRect.width - arrowSize - 4
          arrowTop = tooltipRect.height / 2 - arrowSize / 2
          arrowLeft = tooltipRect.width + 4
          arrowClass = 'right'
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          left = rect.right + arrowSize + 4
          arrowTop = tooltipRect.height / 2 - arrowSize / 2
          arrowLeft = -arrowSize - 4
          arrowClass = 'left'
          break
        default:
          break
      }

      // Clamp to window bounds
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))
      
      // Allow top to go negative but ensure tooltip stays in viewport
      if (top < 8) {
        top = Math.max(8, rect.bottom + arrowSize + 4) // Fallback to bottom if not enough space
      }
      if (top + tooltipRect.height > window.innerHeight - 8) {
        top = Math.max(8, rect.top - tooltipRect.height - arrowSize - 4) // Try top position
      }

      setStyles({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 50,
      })

      setArrowStyles({
        position: 'absolute',
        top: `${arrowTop}px`,
        left: `${arrowLeft}px`,
        zIndex: 51,
      })
    }

    // Calculate position immediately
    calculatePosition()
    
    // Also recalculate after a delay to account for scroll completion
    const timer = setTimeout(calculatePosition, 300)

    // Recalculate on window resize
    const handleResize = () => calculatePosition()
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [visible, elementRef, position])

  if (!visible) return null

  const bgColor = isDarkMode
    ? 'bg-slate-900/20 backdrop-blur-xl border border-emerald-500/60 text-white'
    : 'bg-white/20 backdrop-blur-xl border border-emerald-400/60 text-slate-900'

  const arrowColor = isDarkMode ? 'rgba(15,23,42,0.2)' : 'rgba(255,255,255,0.2)'
  const borderColor = isDarkMode ? '#10b98166' : '#34d39966'

  // Arrow triangle using SVG
  const Arrow = ({ direction }) => {
    const arrowMap = {
      top: (
        <svg width="20" height="10" viewBox="0 0 20 10" style={arrowStyles}>
          <polygon points="10,0 20,10 0,10" fill={arrowColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      ),
      bottom: (
        <svg width="20" height="10" viewBox="0 0 20 10" style={arrowStyles}>
          <polygon points="0,0 20,0 10,10" fill={arrowColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      ),
      left: (
        <svg width="10" height="20" viewBox="0 0 10 20" style={arrowStyles}>
          <polygon points="0,10 10,0 10,20" fill={arrowColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      ),
      right: (
        <svg width="10" height="20" viewBox="0 0 10 20" style={arrowStyles}>
          <polygon points="10,10 0,0 0,20" fill={arrowColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      ),
    }
    return arrowMap[direction] || null
  }

  return (
    <div
      style={styles}
      className={`${bgColor} rounded-lg px-4 py-3 shadow-lg shadow-black/20 max-w-xs animate-fadeIn relative pointer-events-auto`}
      data-tutorial-tooltip="true"
    >
      {/* Arrow pointer */}
      <Arrow direction={position} />

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute -top-2 -right-2 bg-slate-700 hover:bg-slate-600 rounded-full p-1 transition z-50"
      >
        <X size={14} />
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
