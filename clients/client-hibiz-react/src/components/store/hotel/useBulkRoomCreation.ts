import { useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import { apiRpc } from "@hi/common"
import { useQueryClient } from "@tanstack/react-query"
import type { BulkRoomFormData } from "@/components/hotel/FloorAndRooms/Room/types"
import { useError } from "../useError"

export const useBulkRoomCreation = (businessId: string, onClose?: () => void) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { setError, setOpenErrorModal } = useError(s => ({
    setError: s.setError,
    setOpenErrorModal: s.setOpenErrorModal
  }))

  // Bulk room naming state
  const [usePrefix, setUsePrefix] = useState(false)
  const [prefix, setPrefix] = useState("Room")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")

  // Room data state
  const [formData, setFormData] = useState<BulkRoomFormData>({
    roomTypeId: "",
    staffIds: [],
    zoneId: "",
  })

  // Errors state
  const [errors, setErrors] = useState({
    range: "",
    roomTypeId: "",
    zoneId: "",
  })

  // Preview room names
  const previewRoomNames = useCallback(() => {
    if (!rangeStart || !rangeEnd) return []

    const start = Number.parseInt(rangeStart)
    const end = Number.parseInt(rangeEnd)

    if (Number.isNaN(start) || Number.isNaN(end) || start >= end || end - start > 100) return []

    const names = []
    for (let i = start; i <= end; i++) {
      names.push(usePrefix && prefix ? `${prefix}${i}` : `${i}`)
    }

    return names
  }, [rangeStart, rangeEnd, usePrefix, prefix])

  // Handle form field changes
  const handleChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error when user types
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }))
      }
    },
    [errors],
  )

  // Handle staff selection toggle
  const toggleStaff = useCallback((staffId: string) => {
    setFormData((prev) => {
      const staffIds = [...prev.staffIds]

      if (staffIds.includes(staffId)) {
        return {
          ...prev,
          staffIds: staffIds.filter((id) => id !== staffId),
        }
      } else {
        return {
          ...prev,
          staffIds: [...staffIds, staffId],
        }
      }
    })
  }, [])

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const newErrors = { ...errors }
    let isValid = true

    if (currentStep === 1) {
      // Validate range
      if (!rangeStart || !rangeEnd) {
        newErrors.range = "Please specify both start and end of the range"
        isValid = false
      } else {
        const start = Number.parseInt(rangeStart)
        const end = Number.parseInt(rangeEnd)

        if (Number.isNaN(start) || Number.isNaN(end)) {
          newErrors.range = "Range must contain valid numbers"
          isValid = false
        } else if (start >= end) {
          newErrors.range = "End number must be greater than start number"
          isValid = false
        } else if (end - start > 100) {
          newErrors.range = "Cannot create more than 100 rooms at once"
          isValid = false
        }
      }

      // Validate room type
      if (!formData.roomTypeId) {
        newErrors.roomTypeId = "Please select a room type"
        isValid = false
      }
    } else if (currentStep === 3) {
      // Validate floor selection
      if (!formData.zoneId) {
        newErrors.zoneId = "Please select a floor"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }, [currentStep, rangeStart, rangeEnd, formData.roomTypeId, formData.zoneId, errors])

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [validateCurrentStep])

  // Handle previous step
  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      onClose?.()
    } else {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep, onClose])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return

    try {
      setIsSubmitting(true)

      // Format the name field based on prefix usage
      let nameField = `${rangeStart}-${rangeEnd}`
      if (usePrefix && prefix) {
        nameField = `${prefix}${rangeStart}-${rangeEnd}`
      }

      const payload = {
        businessId,
        name: nameField,
        roomTypeId: formData.roomTypeId,
        zoneId: formData.zoneId,
        staffIds: formData.staffIds,
      }

      const response = await apiRpc.hotel.rooms.bulk.$post({
        json: payload,
      })

      if (response.status === 400 || response.status === 401) {
        const errorData = await response.json()
        setError(errorData?.message || "Failed to create rooms in bulk")
        setOpenErrorModal(true)
        return
      }
      if (response.status === 409) {
        const errorData = await response.json()
        setError(errorData?.message || "Failed to create rooms in bulk")
        setOpenErrorModal(true)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error?.message || "Failed to create rooms in bulk")
      }

      const result = await response.json()

      toast.success("Successfully created rooms")
      queryClient.invalidateQueries({ queryKey: ["getAllHotelRooms", businessId] })
      onClose?.()
    } catch (error) {
      console.error("Error creating rooms in bulk:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create rooms in bulk")
    } finally {
      setIsSubmitting(false)
    }
  }, [businessId, usePrefix, prefix, rangeStart, rangeEnd, formData, validateCurrentStep, onClose])

  const previewNames = previewRoomNames()

  return {
    currentStep,
    formData,
    errors,
    isLoading: isSubmitting,
    handleChange,
    toggleStaff,
    handleNext,
    handleBack,
    handleSubmit,
    usePrefix,
    setUsePrefix,
    prefix,
    setPrefix,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    previewNames,
  }
}

