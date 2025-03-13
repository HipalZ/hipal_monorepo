import { memo, lazy, Suspense } from "react"
import { Bed, Edit } from "lucide-react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import useBusinessData from "@/components/store/useBusinessData"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import { useCreateHotelRoom, useUpdateHotelRoom } from "@/hooks/hotel/useRoomHook"
import toast from "react-hot-toast"
import { useState, useCallback, useMemo } from "react"
import { useRoomStore } from "@/components/store/hotel/useRoomStore"

// Lazy load components
const FirstStep = lazy(() => import("./FirstStepRoom"))
const SecondStep = lazy(() => import("./SecondStepRoom"))
const ThirdStep = lazy(() => import("./ThirdStepRoom"))
const FourthStep = lazy(() => import("./FourthStepRoom"))
const FifthStep = lazy(() => import("./FifthStepRoom"))
const StepIndicatior = lazy(() => import("../../HotelStaff/StepIndicatior"))

// Step configuration
const steps = [
  { id: 1, label: "Room Info" },
  { id: 2, label: "Staff" },
  { id: 3, label: "Floor" },
  { id: 4, label: "Images" },
  { id: 5, label: "Preview" },
]

interface AddRoomProps {
  roomToEdit?: any
  onClose?: () => void
}

const AddRoom: React.FC<AddRoomProps> = ({ roomToEdit, onClose }) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const { createRoom, createRoomLoader } = useCreateHotelRoom()
  const { updateRoom, updateRoomLoader } = useUpdateHotelRoom()
  const [isSubmitting, setIsSubmitting] = useState(false)
   const {setOpenAddRoomModal} = useRoomStore((state) => ({
          setOpenAddRoomModal: state.setOpenAddRoomModal
      }))

  // Get state from store
  const {
    isEditMode,
    editRoomId,
    roomInfo,
    selectedAmenities,
    selectedFloorId,
    selectedStaffIds,
    currentStep,
    setCurrentStep,
    validateCurrentStep,
    resetForm,
    roomImages,
  } = useRoomFormStore(
    (state) => ({
      isEditMode: state.isEditMode,
      editRoomId: state.editRoomId,
      roomInfo: state.roomInfo,
      selectedAmenities: state.selectedAmenities,
      selectedFloorId: state.selectedFloorId,
      selectedStaffIds: state.selectedStaffIds,
      currentStep: state.currentStep,
      setCurrentStep: state.setCurrentStep,
      validateCurrentStep: state.validateCurrentStep,
      resetForm: state.resetForm,
      roomImages: state.roomImages,
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
      setOpenAddRoomModal(false)
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
        name: roomInfo.name,
        description: roomInfo.description,
        roomType: roomInfo.roomType,
        pricePerNight: roomInfo.pricePerNight,
        capacity: roomInfo.capacity,
        size: roomInfo.size,
        availability: roomInfo.availability,
        zoneId: selectedFloorId,
        amenities: selectedAmenities,
        staffIds: selectedStaffIds,
        tax: 0, 
        images: roomImages,
        userIds: [], 
      }

      if (isEditMode && editRoomId) {
        await updateRoom({
          ...payload,
          roomId: editRoomId,
        })
      } else {
        await createRoom(payload)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} room:`, error)
      toast.error(`Failed to ${isEditMode ? "update" : "create"} room`)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    businessId,
    createRoom,
    editRoomId,
    isEditMode,
    onClose,
    resetForm,
    roomInfo,
    selectedAmenities,
    selectedFloorId,
    selectedStaffIds,
    updateRoom,
    roomImages,
  ])


  // Configure buttons based on current step
  const buttons = useMemo(
    () => [
      {
        text: "",
        onClick: handleBack,
        isBackButton: true,
        className: "pl-3 rounded-md",
      },
      currentStep < 5
        ? {
            text: "Next",
            onClick: handleNext,
            className: "rounded-md",
          }
        : {
            text: isSubmitting ? "Saving..." : isEditMode ? "Update Room" : "Create Room",
            onClick: handleSubmit,
            icon: isEditMode ? <Edit className="w-4 h-4 ml-2" /> : <Bed className="w-4 h-4 ml-2" />,
            className: "rounded-md",
            highlight: true,
            disable: isSubmitting || createRoomLoader || updateRoomLoader,
          },
    ],
    [currentStep, createRoomLoader, handleBack, handleNext, handleSubmit, isEditMode, isSubmitting, updateRoomLoader],
  )

  return (
    <div className="w-full max-w-md p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Room" : "Add New Room"}</h1>
        <div className="flex items-center space-x-1">
          {isEditMode ? <Edit className="w-5 h-5 text-primary" /> : <Bed className="w-5 h-5 text-primary" />}
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StepIndicatior currentStep={currentStep} steps={steps} />
      </Suspense>

      {/* Step content */}
      <div className="mb-6 h-[80dvh] overflow-auto pb-[7rem] hide-scrollbar">
        <Suspense fallback={<LoadingSpinner />}>
          {
            currentStep === 1 && <FirstStep />
          }
          {
            currentStep === 2 && <FourthStep />
          }
          {
            currentStep === 3 && <ThirdStep />
          }
          {
            currentStep === 4 && <SecondStep />
          }
          {
            currentStep === 5 && <FifthStep />
          }
        </Suspense>
      </div>

      {/* Navigation buttons */}
      <AdvancedBottomButton fixed={true} maxWidth="30rem" buttons={buttons} />
    </div>
  )
}

export default memo(AddRoom)

