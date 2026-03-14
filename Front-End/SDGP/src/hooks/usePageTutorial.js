import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to manage per-page tutorial state
 * Tracks which tutorial tooltips user has seen using localStorage
 */
export const usePageTutorial = (pageName, tutorialSteps = []) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [visitedPages, setVisitedPages] = useState({})

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ricevision_tutorial_pages')
    
    if (stored) {
      try {
        const pages = JSON.parse(stored)
        setVisitedPages(pages)
        // Show tutorial if this is first time on this page
        if (!pages[pageName] && tutorialSteps.length > 0) {
          setShowTutorial(true)
        }
      } catch (e) {
        console.error('Failed to parse tutorial pages', e)
      }
    } else {
      // First time ever - show tutorial if we have steps
      if (tutorialSteps.length > 0) {
        setShowTutorial(true)
      }
    }
  }, [pageName, tutorialSteps.length])

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
    const updated = { ...visitedPages, [pageName]: true }
    setVisitedPages(updated)
    localStorage.setItem('ricevision_tutorial_pages', JSON.stringify(updated))
  }, [pageName, visitedPages])

  // Skip entire tutorial
  const skipTutorial = useCallback(() => {
    closeTutorial()
  }, [closeTutorial])

  // Reset tutorial for testing
  const resetTutorial = useCallback(() => {
    localStorage.removeItem('ricevision_tutorial_pages')
    setVisitedPages({})
    setCurrentStep(0)
    setShowTutorial(true)
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
  }
}
