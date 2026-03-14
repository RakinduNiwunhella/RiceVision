import React, { useEffect, useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

/**
 * Inline tutorial tooltip component
 * Displays helpful guidance next to interactive elements
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

  useEffect(() => {
    if (!visible || !elementRef?.current) return

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    const tooltip = document.querySelector('[data-tutorial-tooltip="true"]')
    
    if (!tooltip) return

    const tooltipRect = tooltip.getBoundingClientRect()
    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 12
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        break
      case 'bottom':
        top = rect.bottom + 12
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        left = rect.left - tooltipRect.width - 12
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        left = rect.right + 12
        break
      default:
        break
    }

    // Clamp to window bounds
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8))

    setStyles({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 50,
    })
  }, [visible, elementRef, position])

  if (!visible) return null

  const bgColor = isDarkMode
    ? 'bg-slate-800 border border-emerald-500/50 text-white'
    : 'bg-white border border-emerald-400 text-slate-900'

  return (
    <div
      style={styles}
      className={`${bgColor} rounded-lg px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-sm max-w-xs animate-fadeIn`}
      data-tutorial-tooltip="true"
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute -top-2 -right-2 bg-slate-700 hover:bg-slate-600 rounded-full p-1 transition"
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
