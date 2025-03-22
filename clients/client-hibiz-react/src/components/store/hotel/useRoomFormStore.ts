import { create } from "zustand"
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook"

// Update the errors interface to match RoomFormErrors
interface RoomFormState {
  // Form mode
  isEditMode: boolean
  editRoomId: string | null

  // Form data
  roomInfo: {
    name: string
  }
  roomTypeId: string
  selectedFloorId: string
  selectedStaffIds: string[]

  // Form state
  currentStep: number
  errors: {
    name: string
    roomTypeId: string
    staffIds: string
    zoneId: string
  }

  // Actions
  setRoomInfo: (info: Partial<RoomFormState["roomInfo"]>) => void
  setRoomTypeId: (id: string) => void
  setSelectedFloorId: (floorId: string) => void
  toggleStaff: (staffId: string) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  validateCurrentStep: () => boolean
  clearErrors: () => void
  setError: (field: keyof RoomFormState["errors"], message: string) => void

  // Edit mode actions
  setEditMode: (isEdit: boolean) => void
  setEditRoomId: (id: string | null) => void
  initializeFormForEdit: (roomData: IHotelRoom) => void
}

// Update the initial errors state
const useRoomFormStore = create<RoomFormState>((set, get) => ({
  // Initial state
  isEditMode: false,
  editRoomId: null,
  roomInfo: {
    name: "",
  },
  roomTypeId: "",
  selectedFloorId: "",
  selectedStaffIds: [],
  currentStep: 1,
  errors: {
    name: "",
    roomTypeId: "",
    staffIds: "",
    zoneId: "",
  },

  // Actions
  setRoomInfo: (info) =>
    set((state) => ({
      roomInfo: { ...state.roomInfo, ...info },
    })),

  setRoomTypeId: (id) =>
    set({
      roomTypeId: id,
    }),

  setSelectedFloorId: (floorId) =>
    set({
      selectedFloorId: floorId,
    }),

  toggleStaff: (staffId) =>
    set((state) => {
      const isSelected = state.selectedStaffIds.includes(staffId)

      if (isSelected) {
        return {
          selectedStaffIds: state.selectedStaffIds.filter((id) => id !== staffId),
        }
      } else {
        return {
          selectedStaffIds: [...state.selectedStaffIds, staffId],
        }
      }
    }),

  setCurrentStep: (step) => set({ currentStep: step }),

  resetForm: () =>
    set({
      isEditMode: false,
      editRoomId: null,
      roomInfo: {
        name: "",
      },
      roomTypeId: "",
      selectedFloorId: "",
      selectedStaffIds: [],
      currentStep: 1,
      errors: {
        name: "",
        roomTypeId: "",
        staffIds: "",
        zoneId: "",
      },
    }),

  // Update the validateCurrentStep function to use zoneId instead of floor
  validateCurrentStep: () => {
    const { currentStep, roomInfo, roomTypeId, selectedFloorId, clearErrors, setError } = get()

    // Clear previous errors
    clearErrors()

    // Validate based on current step
    if (currentStep === 1) {
      let isValid = true

      if (!roomInfo.name.trim()) {
        setError("name", "Room name is required")
        isValid = false
      }

      if (!roomTypeId) {
        setError("roomTypeId", "Please select a room type")
        isValid = false
      }

      return isValid
    }

    if (currentStep === 3) {
      let isValid = true

      if (!selectedFloorId) {
        setError("zoneId", "Please select a floor")
        isValid = false
      }

      return isValid
    }

    return true
  },

  // Update the clearErrors function
  clearErrors: () =>
    set({
      errors: {
        name: "",
        roomTypeId: "",
        staffIds: "",
        zoneId: "",
      },
    }),

  setError: (field, message) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [field]: message,
      },
    })),

  // Edit mode actions
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),

  setEditRoomId: (id) => set({ editRoomId: id }),

  initializeFormForEdit: (roomData) => {
    set({
      isEditMode: true,
      editRoomId: roomData._id,
      roomInfo: {
        name: roomData.name,
      },
      roomTypeId: roomData.roomTypeId || "",
      selectedFloorId: roomData.zoneId || "",
      selectedStaffIds: roomData.staffIds || [],
      currentStep: 1,
    })
  },
}))

export default useRoomFormStore

