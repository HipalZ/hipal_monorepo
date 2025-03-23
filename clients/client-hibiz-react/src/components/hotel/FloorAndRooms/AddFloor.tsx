import { memo, lazy, Suspense } from "react"
import { Building2, Edit } from "lucide-react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import useBusinessData from "@/components/store/useBusinessData"
import { useCreateHotelFloor, useUpdateHotelFloor } from "@/hooks/useFloorHook"
import toast from "react-hot-toast"
import { useState, useCallback, useMemo } from "react"
import useFloorFormStore, { useFloorStore } from "@/components/store/hotel/useFloorStore"

// Lazy load components
const FirstStep = lazy(() => import("./steps/FirstStep"))
const SecondStep = lazy(() => import("./steps/SecondStep"))
const ThirdStep = lazy(() => import("./steps/ThirdStep"))
const StepIndicatior = lazy(() => import("../HotelStaff/StepIndicatior"))

// Step configuration
const steps = [
  { id: 1, label: "Floor Info" },
  { id: 2, label: "Rooms" },
  { id: 3, label: "Preview" },
]

interface AddFloorProps {
  floorToEdit?: any
  onClose?: () => void
}

const AddFloor: React.FC<AddFloorProps> = ({ floorToEdit, onClose }) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const { createFloor, createHotlePending } = useCreateHotelFloor()
  const { updateFloor, updateFloorPending } = useUpdateHotelFloor()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setAddFloorModal } = useFloorStore(
    s => ({
      setAddFloorModal: s.setAddFloorModal
    })
  )

  // Get state from store
  const {
    isEditMode,
    editFloorId,
    floorInfo,
    selectedRooms,
    currentStep,
    setCurrentStep,
    validateCurrentStep,
    resetForm,
  } = useFloorFormStore(
    (state) => ({
      isEditMode: state.isEditMode,
      editFloorId: state.editFloorId,
      floorInfo: state.floorInfo,
      selectedRooms: state.selectedRooms,
      currentStep: state.currentStep,
      setCurrentStep: state.setCurrentStep,
      validateCurrentStep: state.validateCurrentStep,
      resetForm: state.resetForm,
    })
  )

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, setCurrentStep, validateCurrentStep])

  // Handle previous step
  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      resetForm()
      setAddFloorModal(false)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, onClose, resetForm, setCurrentStep])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)

      const payload = {
        businessId,
        name: floorInfo.name,
        tax: floorInfo.tax,
        availability: floorInfo.availability,
        amenities: floorInfo.amenities,
        roomIds: selectedRooms.map((room) => room._id),
      }

      if (isEditMode && editFloorId) {
        await updateFloor({
          ...payload,
          zoneId: editFloorId,
        })
      } else {
        await createFloor(payload)
      }

    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} floor:`, error)
      toast.error(`Failed to ${isEditMode ? "update" : "create"} floor`)
    } finally {
      setIsSubmitting(false)
    }
  }, [businessId, createFloor, editFloorId, floorInfo, isEditMode, onClose, resetForm, selectedRooms, updateFloor])

  // Get current step component
  const CurrentStepComponent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <FirstStep />
      case 2:
        return <SecondStep />
      case 3:
        return <ThirdStep />
      default:
        return <FirstStep />
    }
  }, [currentStep])

  // Configure buttons based on current step
  const buttons = useMemo(
    () => [
      {
        text: "",
        onClick: handleBack,
        isBackButton: true,
        className: "pl-3 rounded-md",
      },
      currentStep < 3
        ? {
          text: "Next",
          onClick: handleNext,
          className: "rounded-md w-full",
        }
        : {
          text: isSubmitting ? "Saving..." : isEditMode ? "Update Floor" : "Create Floor",
          onClick: handleSubmit,
          icon: isEditMode ? <Edit className="w-4 h-4 ml-2" /> : <Building2 className="w-4 h-4 ml-2" />,
          className: "rounded-md w-full",
          highlight: true,
          disable: isSubmitting || createHotlePending || updateFloorPending,
        },
    ],
    [
      currentStep,
      createHotlePending,
      handleBack,
      handleNext,
      handleSubmit,
      isEditMode,
      isSubmitting,
      updateFloorPending,
    ],
  )

  return (
    <div className="w-full max-w-md p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Floor" : "Add New Floor"}</h1>
        <div className="flex items-center space-x-1">
          {isEditMode ? <Edit className="w-5 h-5 text-primary" /> : <Building2 className="w-5 h-5 text-primary" />}
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StepIndicatior currentStep={currentStep} steps={steps} />
      </Suspense>

      {/* Step content */}
      <div className="mb-6 h-[80dvh] overflow-auto pb-[7rem] hide-scrollbar">
        <Suspense fallback={<LoadingSpinner />}>{CurrentStepComponent}</Suspense>
      </div>

      {/* Navigation buttons */}
      <AdvancedBottomButton fixed={true} maxWidth="30rem" buttons={buttons} />
    </div>
  )
}

export default memo(AddFloor)

