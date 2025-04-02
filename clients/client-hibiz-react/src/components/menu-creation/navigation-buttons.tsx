import { memo, useCallback } from "react"
import { useMenuCreationStore } from "@/components/store/useMenuCreationStore"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import useBusinessData from "@/components/store/useBusinessData"

interface NavigationButtonsProps {
  onComplete: (payload: any) => void
  isLoading?: boolean
  isEditing?: boolean
}

const NavigationButtons = memo(({ onComplete, isLoading = false, isEditing = false }: NavigationButtonsProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) || ""

  const { currentStep, setCurrentStep, canProceed, getPayload, resetStore } = useMenuCreationStore((state) => ({
    currentStep: state.currentStep,
    setCurrentStep: state.setCurrentStep,
    canProceed: state.canProceed,
    getPayload: state.getPayload,
    resetStore: state.resetStore,
  }))

  const handleNext = useCallback(async () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1)
    } else {
      const storePayload = getPayload()

      try {
        // Prepare API payload
        const apiPayload = {
          name: storePayload.name,
          businessId,
          zoneIds: storePayload.zoneIds,
          menuType: storePayload.menuType,
          days: storePayload.days,
          categoryLayout: storePayload.categoryLayout,
          cardLayout: storePayload.cardLayout,
          startTime: storePayload.startTime,
          endTime: storePayload.endTime,
          primaryColor: storePayload.primaryColor,
          secondaryColor: storePayload.secondaryColor,
          isActive: true,
        }
        if (storePayload.sourceMenuId) {
          apiPayload.sourceMenuId = storePayload.sourceMenuId
          apiPayload.copyCompleteMenu = storePayload.copyCompleteMenu
        }

        // Call onComplete with the payload
        onComplete(apiPayload)
      } catch (error) {
        console.error("Failed to prepare menu data:", error)
        alert("Failed to prepare menu data. Please try again.")
      }
    }
  }, [currentStep, setCurrentStep, onComplete, getPayload, businessId])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep])

  const handleReset = useCallback(() => {
    resetStore()
  }, [resetStore])

  // Get the button text based on current step
  const getButtonText = useCallback(() => {
    if (currentStep === 8) {
      return isEditing ? "Update" : "Complete"
    }
    return "Next"
  }, [currentStep, isEditing])

  return (
    <AdvancedBottomButton
      fixed={true}
      maxWidth="30rem"
      buttons={[
        {
          text: "",
          isBackButton: true,
          onClick: currentStep === 1 ? handleReset : handleBack,
          className: "pl-3 rounded-md",
          disable: isLoading,
        },
        {
          text: isLoading ? "Saving..." : getButtonText(),
          onClick: handleNext,
          disable: !canProceed() || isLoading,
          className: `w-full px-4 py-3 rounded-md
            ${canProceed() && !isLoading
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `,
        },
      ]}
    />
  )
})

NavigationButtons.displayName = "NavigationButtons"
export default NavigationButtons

