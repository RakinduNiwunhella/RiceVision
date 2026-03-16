import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'

const REPLAY_KEY = 'ricevision_force_tutorial_replay'
const LOCAL_OVERRIDE_KEY = 'ricevision_local_onboarding_done'

/**
 * Custom hook to manage first-time onboarding tutorial state.
 * Relies on Supabase user_metadata for cross-device persistence.
 */
export const usePageTutorial = (pageName, tutorialSteps = []) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const hasInitialized = useRef(false)

  const isDashboard = pageName === 'dashboard'

  useEffect(() => {
    // Only 'dashboard' auto-starts tutorials.
    // Ensure we trigger only when steps exist and we haven't initialized yet
    if (!isDashboard || tutorialSteps.length === 0) return
    if (hasInitialized.current) return

    const initTutorialState = async () => {
      hasInitialized.current = true;
      
      // 1. Check for manual replay request
      if (localStorage.getItem(REPLAY_KEY) === 'true') {
        localStorage.removeItem(REPLAY_KEY)
        setShowTutorial(true)
        return
      }

      // 2. Client-side fast path override 
      // (prevents flash if supabase call takes a moment)
      if (localStorage.getItem(LOCAL_OVERRIDE_KEY) === 'true') {
        setShowTutorial(false)
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()

        // If no user (logged out), don't show.
        if (!user) return

        // 3. True backend check
        const isCompleted = user.user_metadata?.onboarding_completed === true

        if (isCompleted) {
          localStorage.setItem(LOCAL_OVERRIDE_KEY, 'true')
          setShowTutorial(false)
        } else {
          setShowTutorial(true)
        }
      } catch (err) {
        console.error("Failed to check onboarding state:", err)
      }
    }

    initTutorialState()
  }, [isDashboard, tutorialSteps.length])

  // Move to next tutorial step
  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      closeTutorial()
    }
  }, [currentStep, tutorialSteps.length])

  // Move to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Mark onboarding complete in backend
  const completeOnboarding = async () => {
    localStorage.setItem(LOCAL_OVERRIDE_KEY, 'true')
    try {
      await supabase.auth.updateUser({
        data: { onboarding_completed: true }
      })
    } catch (err) {
      console.error("Failed to save onboarding completion:", err)
    }
  }

  // Close tutorial
  const closeTutorial = useCallback(() => {
    setShowTutorial(false)
    completeOnboarding()
  }, [])

  // Skip tutorial entirely
  const skipTutorial = useCallback(() => {
    setShowTutorial(false)
    completeOnboarding()
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
  }
}
