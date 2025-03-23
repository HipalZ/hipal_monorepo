import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import type { IHotelFloor } from "@/hooks/useFloorHook";
import { create } from "zustand";

interface Floor {
    floorData: IHotelFloor[]
    setFloorData: (data: IHotelFloor[]) => void

    addFloorModal: boolean
    setAddFloorModal: (status: boolean) => void
}

export const useFloorStore = create<Floor>((set) => ({
    floorData: [],
    setFloorData: (data: IHotelFloor[]) => set({ floorData: data }),

    addFloorModal: false,
    setAddFloorModal: (status: boolean) => set({ addFloorModal: status })
}))

interface FloorFormState {
    // Form mode
    isEditMode: boolean
    editFloorId: string | null
  
    // Form data
    floorInfo: {
      name: string
      tax: number
      availability: boolean
      amenities: string[]
    }
    selectedRooms: IHotelRoom[]
  
    // Form state
    currentStep: number
    errors: {
      name: string
      tax: string
    }
  
    // Actions
    setFloorInfo: (info: Partial<FloorFormState["floorInfo"]>) => void
    toggleRoom: (room: IHotelRoom) => void
    setCurrentStep: (step: number) => void
    resetForm: () => void
    validateCurrentStep: () => boolean
    clearErrors: () => void
    setError: (field: keyof FloorFormState["errors"], message: string) => void
  
    // Edit mode actions
    setEditMode: (isEdit: boolean) => void
    setEditFloorId: (id: string | null) => void
    initializeFormForEdit: (floorData: IHotelFloor, availableRooms: IHotelRoom[]) => void
  }
  
  const useFloorFormStore = create<FloorFormState>((set, get) => ({
    // Initial state
    isEditMode: false,
    editFloorId: null,
    floorInfo: {
      name: "",
      tax: 0,
      availability: true,
      amenities: [],
    },
    selectedRooms: [],
    currentStep: 1,
    errors: {
      name: "",
      tax: "",
    },
  
    // Actions
    setFloorInfo: (info) =>
      set((state) => ({
        floorInfo: { ...state.floorInfo, ...info },
      })),
  
    toggleRoom: (room) =>
      set((state) => {
        const isSelected = state.selectedRooms.some((r) => r._id === room._id)
  
        if (isSelected) {
          return {
            selectedRooms: state.selectedRooms.filter((r) => r._id !== room._id),
          }
        } else {
          return {
            selectedRooms: [...state.selectedRooms, room],
          }
        }
      }),
  
    setCurrentStep: (step) => set({ currentStep: step }),
  
    resetForm: () =>
      set({
        isEditMode: false,
        editFloorId: null,
        floorInfo: {
          name: "",
          tax: 0,
          availability: true,
          amenities: [],
        },
        selectedRooms: [],
        currentStep: 1,
        errors: {
          name: "",
          tax: "",
        },
      }),
  
    validateCurrentStep: () => {
      const { currentStep, floorInfo, clearErrors, setError } = get()
  
      // Clear previous errors
      clearErrors()
  
      // Validate based on current step
      if (currentStep === 1) {
        let isValid = true
  
        if (!floorInfo.name.trim()) {
          setError("name", "Floor name is required")
          isValid = false
        }
  
        if (floorInfo.tax < 0) {
          setError("tax", "Tax cannot be negative")
          isValid = false
        }
  
        return isValid
      }
  
      return true
    },
  
    clearErrors: () =>
      set({
        errors: {
          name: "",
          tax: "",
        },
      }),
  
    setError: (field, message) =>
      set((state) => ({
        errors: {
          ...state.errors,
          [field]: message,
        },
      })),
  
    setEditMode: (isEdit) => set({ isEditMode: isEdit }),
  
    setEditFloorId: (id) => set({ editFloorId: id }),
  
    initializeFormForEdit: (floorData, availableRooms) => {
      const selectedRoomObjs = availableRooms.filter((room) => floorData.roomIds.includes(room._id))
  
      set({
        isEditMode: true,
        editFloorId: floorData._id,
        floorInfo: {
          name: floorData.name,
          tax: floorData.tax,
          availability: floorData.availability,
          amenities: floorData.amenities || [],
        },
        selectedRooms: selectedRoomObjs,
        currentStep: 1,
      })
    },
  }))
  
  export default useFloorFormStore