import { useCallback } from "react"
import useStaffStore from "@/components/store/hotel/useHotelStaff"

export const useStepNavigation = () => {
  // Extract only the navigation-related state and actions
  const { currentStep, setCurrentStep, validateCurrentStep, resetForm, setStaffModal } = useStaffStore((state) => ({
    currentStep: state.currentStep,
    setCurrentStep: state.setCurrentStep,
    validateCurrentStep: state.validateCurrentStep,
    resetForm: state.resetForm,
    setStaffModal: state.setStaffModal,
  }))

  // Memoized navigation handlers
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, setCurrentStep, validateCurrentStep])

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      setStaffModal(false)
      resetForm()
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep, resetForm, setStaffModal])

  return {
    currentStep,
    handleNext,
    handleBack,
  }
}

