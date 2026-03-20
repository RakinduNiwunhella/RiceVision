import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/**
 * TutorialOverlay — full-screen spotlight tutorial with:
 * - Semi-transparent backdrop with a glowing cut-out around the target element
 * - Compact step card positioned beside the highlighted element
 * - Next / Back / Skip / Finish navigation controls
 * - Step progress dots
 */
const TutorialOverlay = ({
  steps = [],
  currentStep = 0,
  onNext,
  onBack,
  onSkip,
  onFinish,
  visible = false,
}) => {
  const [targetRect, setTargetRect] = useState(null)
  const [cardStyle, setCardStyle] = useState({})

  const PADDING = 14
  const CARD_W = 300
  const CARD_GAP = 20

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  /* ── compute spotlight rect ── */
  const calcRect = useCallback(() => {
    if (!step?.ref?.current) {
      setTargetRect(null)
      return
    }
    const r = step.ref.current.getBoundingClientRect()
    setTargetRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
      centerX: r.left + r.width / 2,
      centerY: r.top + r.height / 2,
    })
  }, [step])

  /* ── scroll target into view then recompute ── */
  useEffect(() => {
    if (!visible || !step?.ref?.current) return

    try {
      step.ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch {/* ignore */}

    calcRect()
    const t = setTimeout(calcRect, 320)

    window.addEventListener('resize', calcRect)
    window.addEventListener('scroll', calcRect, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', calcRect)
      window.removeEventListener('scroll', calcRect, true)
    }
  }, [visible, currentStep, calcRect])

  /* ── card positioning ── */
  useEffect(() => {
    if (!targetRect) return

    const vw = window.innerWidth
    const vh = window.innerHeight
    const CARD_H_ESTIMATE = 180
    const EDGE = 12

    let left = targetRect.left + targetRect.width + CARD_GAP
    let top = targetRect.top

    // flip to left if overflowing right
    if (left + CARD_W > vw - EDGE) {
      left = targetRect.left - CARD_W - CARD_GAP
    }

    // if still overflowing left, center horizontally below the target
    if (left < EDGE) {
      left = Math.max(EDGE, targetRect.centerX - CARD_W / 2)
      top = targetRect.top + targetRect.height + CARD_GAP
    }

    // clamp vertical and horizontal
    top = Math.max(EDGE, Math.min(top, vh - CARD_H_ESTIMATE - EDGE))
    left = Math.max(EDGE, Math.min(left, vw - CARD_W - EDGE))

    setCardStyle({ top, left, width: CARD_W })
  }, [targetRect])

  if (!visible || steps.length === 0) return null

  /* ── SVG spotlight backdrop ── */
  const BackdropWithHole = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (!targetRect) {
      return (
        <div
          className="fixed inset-0 bg-black/70 z-[9990]"
          onClick={onSkip}
        />
      )
    }

    const { top, left, width, height } = targetRect
    const r = 16

    const path = `
      M 0 0 L ${vw} 0 L ${vw} ${vh} L 0 ${vh} Z
      M ${left + r} ${top}
      Q ${left} ${top} ${left} ${top + r}
      L ${left} ${top + height - r}
      Q ${left} ${top + height} ${left + r} ${top + height}
      L ${left + width - r} ${top + height}
      Q ${left + width} ${top + height} ${left + width} ${top + height - r}
      L ${left + width} ${top + r}
      Q ${left + width} ${top} ${left + width - r} ${top}
      Z
    `

    return (
      <svg
        className="fixed inset-0 z-[9990]"
        style={{ position: 'fixed', top: 0, left: 0 }}
        width={vw}
        height={vh}
      >
        <defs>
          <filter id="tv-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* dim backdrop */}
        <path d={path} fill="rgba(0,0,0,0.45)" fillRule="evenodd" />
        {/* glowing emerald ring */}
        <rect
          x={left}
          y={top}
          width={width}
          height={height}
          rx={r}
          fill="none"
          stroke="rgba(52,211,153,0.8)"
          strokeWidth="3"
          filter="url(#tv-glow)"
        />
        {/* clickable backdrop to skip */}
        <path
          d={path}
          fill="transparent"
          fillRule="evenodd"
          style={{ pointerEvents: 'all', cursor: 'default' }}
          onClick={onSkip}
        />
      </svg>
    )
  }

  /* ── step card ── */
  const StepCard = () => (
    <div
      className="fixed z-[9999] tutorial-overlay-card"
      style={cardStyle}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl shadow-black/50 p-5 pointer-events-auto">

        {/* Skip (X) button */}
        <button
          onClick={onSkip}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all"
          title="Skip tutorial"
        >
          <X size={11} className="text-white/85" />
        </button>

        {/* Step counter */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-emerald-400 text-sm leading-none">✦</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Title */}
        {step?.title && (
          <p className="text-sm font-bold text-white leading-snug mb-4">
            {step.title}
          </p>
        )}

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentStep ? 16 : 6,
                height: 6,
                background: i === currentStep
                  ? '#34d399'
                  : i < currentStep
                  ? 'rgba(52,211,153,0.4)'
                  : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Back */}
          <button
            onClick={onBack}
            disabled={isFirst}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isFirst
                ? 'text-white/85 cursor-not-allowed'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChevronLeft size={14} />
            Back
          </button>

          <div className="flex items-center gap-2">
            {/* Skip */}
            <button
              onClick={onSkip}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/85 hover:text-white/90 hover:bg-white/5 transition-all"
            >
              Skip
            </button>

            {/* Next or Finish */}
            {isLast ? (
              <button
                onClick={onFinish}
                className="px-4 py-1.5 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                Finish ✓
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 transition-all active:scale-95"
              >
                Next
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(
    <>
      <BackdropWithHole />
      <StepCard />
    </>,
    document.body
  )
}

export default TutorialOverlay
