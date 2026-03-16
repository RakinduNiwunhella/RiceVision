import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'

const REPLAY_KEY = 'ricevision_force_tutorial_replay'
const LOCAL_OVERRIDE_KEY = 'ricevision_local_onboarding_done'
const GLOBAL_TUTORIAL_ACTIVE = 'ricevision_global_tutorial_active'

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
    // Abort early if there are no steps or we already initialized this specific mount
    if (!tutorialSteps || tutorialSteps.length === 0) return;
    if (hasInitialized.current) return;

    const initTutorialState = async () => {
      hasInitialized.current = true;
      
      // 1. Check for manual replay request (Dashboard only usually)
      if (localStorage.getItem(REPLAY_KEY) === 'true') {
        localStorage.removeItem(REPLAY_KEY)
        // Set the global active flag so subsequent pages also auto-play
        localStorage.setItem(GLOBAL_TUTORIAL_ACTIVE, 'true')
        localStorage.removeItem(LOCAL_OVERRIDE_KEY) // Clear override so logic runs 
        setShowTutorial(true)
        return
      }

      // 2. If the user is actively in a multi-page tour
      if (localStorage.getItem(GLOBAL_TUTORIAL_ACTIVE) === 'true') {
        setShowTutorial(true)
        return
      }

      // 3. Client-side fast path override 
      // (prevents flash if supabase call takes a moment)
      if (localStorage.getItem(LOCAL_OVERRIDE_KEY) === 'true') {
        setShowTutorial(false)
        return
      }

      // 4. True backend check
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // If no user (logged out), don't show.
        if (!user) return

        const isCompleted = user.user_metadata?.onboarding_completed === true

        if (isCompleted) {
          localStorage.setItem(LOCAL_OVERRIDE_KEY, 'true')
          // But if we are in a global tour, don't stop!
          if (localStorage.getItem(GLOBAL_TUTORIAL_ACTIVE) !== 'true') {
            setShowTutorial(false)
          } else {
            setShowTutorial(true)
          }
        } else if (isDashboard) {
          // It's a new user and they just hit the dashboard. Start the global flow.
          localStorage.setItem(GLOBAL_TUTORIAL_ACTIVE, 'true')
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
      // Finished THIS page's tutorial. Do NOT kill the global active flag yet, 
      // let them navigate to the next page and experience that one too.
      setShowTutorial(false)
      // We do set the backend completion though, just in case they drop off.
      completeOnboarding()
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

  // User explicitly dismissed the tutorial, completely stop the global flow
  const closeTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.removeItem(GLOBAL_TUTORIAL_ACTIVE)
    localStorage.removeItem(REPLAY_KEY)
    completeOnboarding()
  }, [])

  return {
    currentStep,
    showTutorial,
    currentTutorialStep: tutorialSteps[currentStep],
    hasMoreSteps: currentStep < tutorialSteps.length - 1,
    nextStep,
    prevStep,
    closeTutorial // Alias for skip/finish entirely
  }
}
