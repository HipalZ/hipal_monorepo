import { useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import { useCreateHotelRoom, useUpdateHotelRoom } from "@/hooks/hotel/useRoomHook"
import useRoomFormStore from "./useRoomFormStore"

export const useRoomCreation = (businessId: string, onClose?: () => void) => {
  const { createRoom, createRoomLoader } = useCreateHotelRoom()
  const { updateRoom, updateRoomLoader } = useUpdateHotelRoom()

  // Get state from store
  const {
    isEditMode,
    editRoomId,
    roomInfo,
    roomTypeId,
    selectedFloorId,
    selectedStaffIds,
    currentStep,
    setCurrentStep,
    validateCurrentStep,
    setRoomInfo,
    setRoomTypeId,
    setSelectedFloorId,
    toggleStaff,
    resetForm,
  } = useRoomFormStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form field changes
  const handleChange = useCallback(
    (field: string, value: any) => {
      if (field === "name") {
        setRoomInfo({ name: value })
      } else if (field === "roomTypeId") {
        setRoomTypeId(value)
      } else if (field === "zoneId") {
        setSelectedFloorId(value)
      }
    },
    [setRoomInfo, setRoomTypeId, setSelectedFloorId],
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
      onClose?.()
      resetForm()
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
        roomTypeId,
        zoneId: selectedFloorId,
        staffIds: selectedStaffIds,
      }

      if (isEditMode && editRoomId) {
        await updateRoom({
          ...payload,
          roomId: editRoomId,
        })
      } else {
        await createRoom(payload)
      }

      onClose?.()
      resetForm()
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} room:`, error)
      toast.error(`Failed to ${isEditMode ? "update" : "create"} room`)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    businessId,
    roomInfo.name,
    roomTypeId,
    selectedFloorId,
    selectedStaffIds,
    isEditMode,
    editRoomId,
    updateRoom,
    createRoom,
    onClose,
    resetForm,
  ])

  return {
    currentStep,
    formData: {
      name: roomInfo.name,
      roomTypeId,
      zoneId: selectedFloorId,
      staffIds: selectedStaffIds,
    },
    errors: useRoomFormStore((state) => ({
      name: state.errors.name,
      roomTypeId: state.errors.roomTypeId,
      staffIds: state.errors.staffIds,
      zoneId: state.errors.zoneId,
    })),
    isSubmitting,
    isLoading: isSubmitting || createRoomLoader || updateRoomLoader,
    isEditMode,
    handleChange,
    toggleStaff,
    handleNext,
    handleBack,
    handleSubmit,
  }
}

