import { type MenuCreationPayload, useMenuCreationStore } from "@/components/store/useMenuCreationStore"
import { useCallback } from "react"

export function useMenuCreation() {
  const store = useMenuCreationStore()

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= 5) {
        store.setCurrentStep(step)
      }
    },
    [store],
  )

  const completeFlow = useCallback(
    async (callback?: (payload: MenuCreationPayload) => void) => {
      const payload = store.getPayload()

      // Call the callback if provided
      if (callback) {
        callback(payload)
      }

      // Return the payload
      return payload
    },
    [store],
  )

  const resetFlow = useCallback(() => {
    store.resetStore()
  }, [store])

  return {
    currentStep: store.currentStep,
    menuType: store.menuType,
    categoryLayout: store.categoryLayout,
    cardLayout: store.cardLayout,
    primaryColor: store.primaryColor,
    secondaryColor: store.secondaryColor,

    // Navigation
    goToStep,
    nextStep: () => goToStep(store.currentStep + 1),
    prevStep: () => goToStep(store.currentStep - 1),

    // Actions
    setMenuType: store.setMenuType,
    setCategoryLayout: store.setCategoryLayout,
    setCardLayout: store.setCardLayout,
    setColors: store.setColors,

    // Flow control
    completeFlow,
    resetFlow,
    canProceed: store.canProceed,
    getPayload: store.getPayload,
  }
}

