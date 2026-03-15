import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ricevision_tutorial_pages'
const HEADER_REQUIRED_STEPS_KEY = 'ricevision_header_required_steps'

const readTutorialPages = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return {}

  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error('Failed to parse tutorial pages', e)
    return {}
  }
}

const isHeaderCurrentVersionComplete = (pages) => {
  const requiredHeaderSteps = Number(localStorage.getItem(HEADER_REQUIRED_STEPS_KEY) || 0)
  if (!requiredHeaderSteps || Number.isNaN(requiredHeaderSteps)) return false

  return !!pages.Header && pages.Header__tutorialStepCount === requiredHeaderSteps
}

/**
 * Custom hook to manage per-page tutorial state
 * Tracks which tutorial tooltips user has seen using localStorage
 * Header page tutorials take priority - page tutorials skip if Header not complete
 */
export const usePageTutorial = (pageName, tutorialSteps = []) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [visitedPages, setVisitedPages] = useState({})
  const [isHeaderComplete, setIsHeaderComplete] = useState(false)
  const pageVersionKey = `${pageName}__tutorialStepCount`

  // Keep all pages in sync when Header tutorial completes in the same tab.
  useEffect(() => {
    const isHeaderPage = pageName === 'Header'

    const syncFromStorage = () => {
      const pages = readTutorialPages()
      setVisitedPages(pages)

      const headerDone = isHeaderCurrentVersionComplete(pages)
      setIsHeaderComplete(headerDone)

      const hasSeenCurrentVersion =
        !!pages[pageName] && pages[pageVersionKey] === tutorialSteps.length
      const shouldShow = tutorialSteps.length > 0 && !hasSeenCurrentVersion
      setShowTutorial(shouldShow && (isHeaderPage || headerDone))
    }

    syncFromStorage()

    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('ricevision:tutorial-pages-updated', syncFromStorage)

    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('ricevision:tutorial-pages-updated', syncFromStorage)
    }
  }, [pageName, tutorialSteps.length, pageVersionKey])

  // Move to next tutorial step
  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finished all steps - mark page as visited
      closeTutorial()
    }
  }, [currentStep, tutorialSteps.length])

  // Move to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Close tutorial and mark page as visited
  const closeTutorial = useCallback(() => {
    setShowTutorial(false)
    const updated = {
      ...readTutorialPages(),
      [pageName]: true,
      [pageVersionKey]: tutorialSteps.length,
    }
    setVisitedPages(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('ricevision:tutorial-pages-updated'))
  }, [pageName, pageVersionKey, tutorialSteps.length])

  // Skip entire tutorial
  const skipTutorial = useCallback(() => {
    closeTutorial()
  }, [closeTutorial])

  // Reset tutorial for testing
  const resetTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setVisitedPages({})
    setIsHeaderComplete(false)
    setCurrentStep(0)
    setShowTutorial(pageName === 'Header')
    window.dispatchEvent(new Event('ricevision:tutorial-pages-updated'))
  }, [pageName])

  const forceShowTutorial = useCallback(() => {
    setCurrentStep(0)
    setShowTutorial(tutorialSteps.length > 0)
  }, [])

  return {
    currentStep,
    showTutorial,
    currentTutorialStep: tutorialSteps[currentStep],
    hasMoreSteps: currentStep < tutorialSteps.length - 1,
    nextStep,
    prevStep,
    closeTutorial,
    skipTutorial,
    resetTutorial,
    forceShowTutorial,
    isHeaderComplete,
    visitedPages,
  }
}
