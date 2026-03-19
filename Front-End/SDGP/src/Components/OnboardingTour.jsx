import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

/**
 * OnboardingTour Component
 * Lightweight first-time user tour with spotlight highlighting
 * Shows once per user, persisted via localStorage
 */

const OnboardingTour = ({
  steps,
  onComplete,
  onSkip,
  storageKey = "hasSeenTour",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState(null);

  // Check if tour should be shown
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(storageKey);
    if (!hasSeenTour && steps.length > 0) {
      // Small delay for DOM to be ready
      setTimeout(() => setIsVisible(true), 800);
    }
  }, [storageKey, steps.length]);

  // Update spotlight position when step changes
  useEffect(() => {
    if (!isVisible || !steps[currentStep]?.target) return;

    const updateSpotlight = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
      }
    };

    // Scroll element into view on step change
    const element = document.querySelector(steps[currentStep].target);
    const container = document.getElementById("app-scroll-container");

    if (element && container) {
      const elementTop = element.offsetTop;

      container.scrollTo({
        top: elementTop - container.clientHeight / 2 + element.clientHeight / 2,
        behavior: "smooth",
      });
    }

    // Initial update with slight delay for scroll
    setTimeout(updateSpotlight, 150);

    // Keep updating during resize/scroll
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [currentStep, isVisible, steps]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Shared cleanup: scroll to top and restore scroll behavior
  const handleTourEnd = useCallback(() => {
    localStorage.setItem(storageKey, "true");

    // Scroll FIRST while component is still mounted
    const container = document.getElementById("app-scroll-container");

    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // THEN hide tour
    setTimeout(() => {
      setIsVisible(false);
    }, 50);
  }, [storageKey]);

  const handleSkip = useCallback(() => {
    handleTourEnd();
    onSkip?.();
  }, [handleTourEnd, onSkip]);

  const handleComplete = useCallback(() => {
    handleTourEnd();
    onComplete?.();
  }, [handleTourEnd, onComplete]);

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!spotlightRect)
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 380;
    const tooltipHeight = 200;
    const gap = 24;

    let top, left;
    let placement = "bottom"; // default

    // Determine vertical placement
    if (
      spotlightRect.top + spotlightRect.height + tooltipHeight + gap <
      viewportHeight
    ) {
      // Below
      top = spotlightRect.top + spotlightRect.height + gap;
      placement = "bottom";
    } else if (spotlightRect.top - tooltipHeight - gap > 0) {
      // Above
      top = spotlightRect.top - tooltipHeight - gap;
      placement = "top";
    } else {
      // Centered vertically if no fit
      top = Math.max(20, (viewportHeight - tooltipHeight) / 2);
    }

    // Horizontal centering with bounds check
    left = spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2;
    left = Math.max(20, Math.min(left, viewportWidth - tooltipWidth - 20));

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Animated spotlight border */}
        {spotlightRect && (
          <div
            className="absolute border-2 border-cyan-400 rounded-2xl transition-all duration-500 ease-out animate-pulse"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              boxShadow: "0 0 30px rgba(34, 211, 238, 0.6)",
            }}
          />
        )}
      </div>

      {/* Tooltip card */}
      <div
        className="fixed z-[9999] pointer-events-auto transition-all duration-500 ease-out"
        style={getTooltipPosition()}
      >
        <div className="glass border border-white/20 rounded-3xl shadow-2xl backdrop-blur-xl p-6 max-w-[380px] animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  Step {currentStep + 1}/{steps.length}
                </span>
              </div>
              <h3 className="text-base font-black text-white tracking-tight">
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="ml-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Skip tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-white/80 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;
